/*
Copyright 2018 Quanergy Systems

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

let http = require("http");
let router = require("router");
let fs = require("fs");
let path = require("path");
let ini = require("ini");
let url = require("url");

let ObjectListener = require("./qortex_object_listener.js");
let ZoneListener = require("./qortex_zone_listener.js");

class Server {
  constructor(port, save_logs, config_filepath) {
    this.port = port;

    this.root_dir = path.resolve(__dirname, "./../../..") + "/";
    this.log_dir = this.root_dir + "logs/";
    this.config_dir = this.config_dir = path.dirname(config_filepath) + "/";
    this.not_found = "<html><body><p>404 not found</p></body></html>";

    this.messages = {};
    this.qortex_listeners = [];

    // this.config is set within configure()
    this.configure(config_filepath);

    this.prepare_message_cache();
    this.create_listeners(save_logs);

    this.filters = {};
    this.load_filters("cart");
    this.load_filters("geo");

    this.create_routes();
  }

  configure(config_filepath) {
    // Load configuration
    this.config = ini.parse(
      fs.readFileSync(config_filepath, "utf-8")
    );

    this.client_dir = this.root_dir + "src/clients/";

    if (this.config.client
     && this.config.client.type) {
      this.client_dir += this.config.client.type + "/";
    }
  }

  prepare_message_cache() {
    this.cached_data = { cart: [], geo: [] };
    let server_names = Object.keys(this.config.servers);
    for (let server_idx in server_names) {
      this.cached_data.geo.push({ timestamp: -1, message: {} });
      this.cached_data.cart.push({ timestamp: -1, message: {} });
    }
  }

  create_listeners(save_logs) {
    // Create listeners
    let server_names = Object.keys(this.config.servers);
    for (let i=0; i<server_names.length; ++i) {
      this.qortex_listeners.push({});
      let last = this.qortex_listeners.length - 1;

      this.qortex_listeners[last].objects =
        new ObjectListener(
          server_names[i],
          this.config.servers[server_names[i]],
          save_logs,
          this.log_dir);

      this.qortex_listeners[last].zones =
        new ZoneListener(
          server_names[i],
          this.config.servers[server_names[i]],
          save_logs,
          this.log_dir);
    }

    for (let i=0; i<this.qortex_listeners.length; ++i) {
      let listeners = this.qortex_listeners[i];
      listeners.objects.attempt_connection();
      listeners.zones.attempt_connection();
    }
  }

  load_filters(type)
  {
    try {
      this.filters[type] =
        fs.readFileSync(this.config_dir + type + "_filters.txt", "utf-8")
        .split("\n")
        .filter(filter => filter.length != 0)
        .filter(filter => filter[0] != '#')
        .map(filter => require("../filters/" + type + "/" + filter));
    }
    catch(err) {
      console.log("Could not find a list for", type, "filters");
      this.filters[type] = [];
    }
  }

  create_routes() {
    this.router = router();

    this.router
      // index.html
      .get("/", this.serve_file())
      .get("/api/object_list/:type", this.serve_data())
      // File in client directory
      .get("/*", this.serve_file());
  }

  serve_data() {
    return (req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });

      let message = this.prepare_api_message(req.params.type);
      res.end(JSON.stringify(message));
    };
  }

  serve_file() {
    return (req, res) => {
      let tokens = req.url.split("/");
      if (tokens.length == 2 && tokens[1] === "")
      {
        req.url = "index.html";
      }

      // Only serve js files in the dist folder, don't serve anything
      // within node_modules, don't serve the node package information
      // and don't serve the README file to the client
      if (tokens[1] == "src" ||
          tokens[1] == "node_modules" ||
          tokens[1] == "package.json" ||
          tokens[1] == "package-lock.json") {
        req.url = "";
      }

      let filepath = this.client_dir;
      filepath += req.url;

      let content_type = "text/plain";
      if (path.extname(filepath) == ".js") {
        content_type = "text/javascript";
      }
      else if (path.extname(filepath) == ".css") {
        content_type = "text/css";
      }
      else if (path.extname(filepath) == ".html") {
        content_type = "text/html";
      }

      fs.readFile(filepath, (err, file_contents) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(this.not_found);
          return;
        }

        res.writeHead(200, { "Content-Type": content_type });
        res.end(file_contents);
      });
    };
  }

  filter(type, data) {
    let filters = this.filters[type];
    for (let filter_idx in filters) {
      let filter = filters[filter_idx];
      let config = this.config.filters[type][filter.name];
      config = config == undefined ? {} : config;
      data = filter.filter(data, config);
    }

    return data;
  }

  create_api_output(listener_index, type)
  {
    let message = {};
    let object_listener = this.qortex_listeners[listener_index].objects;
    let zone_listener = this.qortex_listeners[listener_index].zones;

    let object_output_function = "create_api_output_" + type;
    let zone_output_function = "zones_" + type;
    let object_listener_packet = object_listener[object_output_function]();

    message.info = object_listener_packet.info;
    message.objects = object_listener_packet.objects;
    message.zones = zone_listener[zone_output_function]();

    let cached_data = this.cached_data[type][listener_index];
    let cached_timestamp = cached_data.timestamp;
    let cached_message = cached_data.message;
    if (cached_timestamp != message.info.timestamp)
    {
      cached_message = this.filter(type, message);
      cached_data.message = cached_message;
      cached_data.timestamp = message.info.timestamp;
    }

    return cached_message;
  }

  prepare_api_message(type) {
    let message = [];

    for (let i=0; i<this.qortex_listeners.length; i++) {
      message.push(this.create_api_output(i, type));
    }

    return message;
  }

  start() {
    http.createServer((req, res) => {
      let url = req.url;

      if (url != "/api/object_list/geo" &&
          url != "/api/object_list/cart") {
        console.log(url);
      }

      this.router(req, res, (req, res) => {
        res.writeHead(501);
        res.end(http.STATUS_CODES[501] + "\n");
      });
    }).listen(this.port);

    console.log(
      "Web server started! Listening for connections on port " +
      this.port + ".\n");
  }
}

module.exports = Server;
