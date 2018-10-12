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

let fs = require("fs");
let net = require("net");

let utils = require("./utils.js");

class QortexObjectListener {
  constructor(name, config, save_logs, log_dir) {
    this.name = name;
    this.save_logs = save_logs;
    this.log_dir = log_dir;
    this.log_delimeter = "";
    this.verbose = config.verbose;

    this.socket = new net.Socket(),
    this.packet_size = null,
    this.data_buffer = Buffer.alloc(0),
    this.size_buffer = Buffer.alloc(0),
    
    this.ip_address = config.ip_address;
    this.port = config.object_port;
    this.init_coordinates(config);
    this.display_color = config.display_color;

    this.connected = false;
    this.last_received_packet_timestamp = 0;
      
    this.object_list_geo = {}; // Geodesic coordinates
    this.object_list_cart = {}; // Cartesian coordinates

    if (save_logs) {
      this.create_log_directory(this.log_dir);
      let date_string = new Date().toGMTString()
                                  .replace(/,/g, "")
                                  .replace(/ /g, "_")
                                  .replace(/:/g, "-");
      this.log_filepath = this.log_dir + 
                          date_string +
                          "_" + this.name +
                          "_objects.json";
      fs.appendFile(this.log_filepath,
                    "[",
                    (err) => {
                      if (err) {
                        console.log(err);
                        throw err;
                      }
                    });

      process.on("cleanup" + this.name + " objects", () => {
        if (this.verbose)
        {
          console.log("Cleanup for", this.name, "objects");
        }
        fs.appendFileSync(this.log_filepath, "]");
      });

      process.on("exit", () => {
        if (this.verbose)
        {
          console.log("Got Exit for", this.name, "objects");
        }
        process.emit("cleanup" + this.name + " objects");
      });

      process.on("SIGINT", () => {
        if (this.verbose)
        {
          console.log("Got SIGINT for", this.name, "objects");
        }
        process.exit(130);
      });
    }
  }

  init_coordinates(config) {
    this.x = config.x_position;
    this.y = config.y_position;
    this.z = config.z_position;
    
    if (isNaN(this.x)) {
      this.x = 0;
    }
    if (isNaN(this.y)) {
      this.y = 0;
    }
    if (isNaN(this.z)) {
      this.z = 0;
    }
    
    this.lat = Number(config.lat);
    this.lng = Number(config.lng);
    this.heading = Number(config.heading);

    if (isNaN(this.lat)) {
      this.lat = 0;
    }
    if (isNaN(this.lng)) {
      this.lng = 0;
    }
    if (isNaN(this.heading)) {
      this.heading = 0;
    }
  }

  create_log_directory(dir) {
    let directory_exists = fs.existsSync(dir);
    if (!directory_exists) {
      try {
        fs.mkdirSync(dir);
        if (this.verbose) {
          console.log("Created " + dir + " for storing logs");
        }
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  write_log(packet) {
    fs.appendFile(this.log_filepath,
                  this.log_delimeter +
                  JSON.stringify(packet, null, 2),
                  (err) => {
                    if (err) {
                      console.log(err);
                      throw err;
                    }
                  });

    if (!this.log_delimeter) {
      this.log_delimeter = ",\n";
    }
  }

  create_api_output() {
    return {
      info: {
        name: this.name,
        display_color: this.display_color,
        connected: this.connected,
        timestamp: this.last_received_packet_timestamp
      }
    }
  }

  create_api_output_geo() {
    let output_geo = this.create_api_output();
    
    output_geo.info.lat = this.lat;
    output_geo.info.lng = this.lng;
    output_geo.info.heading = this.heading;
    output_geo.objects = Object.values(this.object_list_geo);

    return output_geo;
  }

  create_api_output_cart() {
    let output_cart = this.create_api_output();

    output_cart.info.position = { x: this.x, y: this.y, z: this.z };
    output_cart.objects = Object.values(this.object_list_cart);

    return output_cart;
  }

  to_world_coordinates(obj_local) {
    let obj_world = {};
    obj_world.id = obj_local.id;

    obj_world.position = {}
    obj_world.position.x = obj_local.position.x + this.x;
    obj_world.position.y = obj_local.position.y + this.y;
    obj_world.position.z = obj_local.position.z + this.z;

    obj_world.size = obj_local.size;
    obj_world.velocity = obj_local.velocity;
    obj_world.classification = obj_local.objectClass;

    return obj_world;
  }

  to_geo_coordinates(obj_cart) {
    let obj_geo = {};
    obj_geo.id = obj_cart.id;
    
    let position = obj_cart.position;
    let lat_lng = utils.xyz_to_geo(this.lat, this.lng, this.heading,
                                   position.x, position.y, position.z);
    obj_geo.lat = lat_lng.lat;
    obj_geo.lng = lat_lng.lng;
    obj_geo.heading = lat_lng.bearing;
    
    obj_geo.size = obj_cart.size;
    obj_geo.velocity = obj_cart.velocity;
    obj_geo.classification = obj_cart.objectClass;
    
    return obj_geo; 
  }

  handle_message() {
    let packet;
    //DEBUG
    //console.log(this.data_buffer.toString());
    packet = JSON.parse(this.data_buffer);
    if (this.save_logs) {
      this.write_log(packet);
    }

    if (packet &&
        packet.object) {
      let indices_present = {};
      for (let idx in packet.object) {
        let obj = packet.object[idx];
        let obj_cart = this.to_world_coordinates(obj);
        let obj_geo = this.to_geo_coordinates(obj);
        this.object_list_cart[obj.id] = obj_cart;
        this.object_list_geo[obj.id] = obj_geo;
        indices_present[obj.id] = true;
      }

      for (let id in this.object_list_cart) {
        if (!indices_present[id]) {
          delete this.object_list_cart[id];
          delete this.object_list_geo[id];
        }
      }

      this.last_received_packet_timestamp = Date.now();

      /*
      //DEBUG  
      console.log("Number of objects:", 
                  Object.keys(this.object_list_cart).length);
      console.log("Objects(Cart):", this.ip_address,
                  this.object_list_cart);
      console.log("Objects(Geo):", this.ip_address, 
                  this.object_list_geo);
      //*/
    }

    
  }

  handle_data(data) {
    //DEBUG
    //console.log("\n");
    let received_bytes = data.length;
    //DEBUG
    //console.log("received bytes", received_bytes);

    if (this.packet_size == null) {
      let remaining_size_bytes = 4 - this.size_buffer.length;
      //DEBUG
      //console.log("remaining size bytes", remaining_size_bytes);

      if (received_bytes >= remaining_size_bytes) {
        // Get or complete the size of the packet
        let new_size_data = data.slice(0, remaining_size_bytes);
        let size_length = this.size_buffer.length + remaining_size_bytes;
        this.size_buffer = Buffer.concat([this.size_buffer, new_size_data],
            size_length);
        this.packet_size = this.size_buffer.readUInt32LE(0);
        // Reset size buffer
        this.size_buffer = Buffer.alloc(0);

        // Process new data
        let new_data = data.slice(remaining_size_bytes);
        this.handle_data(new_data);
        return;
      }
      else {
        let length = this.size_buffer.length + data.length;
        this.size_buffer = Buffer.concat([this.size_buffer, data],
            length);
      }
    }

    if (this.packet_size != null) {
      let remaining_data_bytes = this.packet_size - this.data_buffer.length;
      //DEBUG
      //console.log("remaining data bytes", remaining_data_bytes);

      if (received_bytes >= remaining_data_bytes) {
        // Get or complete the packet
        let new_data = data.slice(0, remaining_data_bytes);
        let data_length = this.data_buffer.length + remaining_data_bytes;
        this.data_buffer = Buffer.concat([this.data_buffer, new_data],
            data_length);
        this.handle_message();

        // Reset packet size variable and data buffer
        this.packet_size = null;
        this.data_buffer = Buffer.alloc(0);
        if (received_bytes > remaining_data_bytes) {
          let remaining_data = data.slice(remaining_data_bytes);
          //DEBUG
          //console.log("remaining_data size", remaining_data.length);
          this.handle_data(remaining_data);
        }
      }
      else {
        let length = this.data_buffer.length + data.length;
        this.data_buffer = Buffer.concat([this.data_buffer, data],
            length);
      }
    }
  }

  attempt_connection() {
    this.socket.on("data", (data) => {
      this.handle_data(data);
    });

    this.socket.on("error", (err) => {
      if (err.errno == "ECONNREFUSED")
      {
        if (this.verbose) {
          console.log(
            "Connection to " +
            this.ip_address + ":" + this.port +
            " refused");
        }
        return;
      }
      
      console.log(err.message); 
    });

    this.socket.on("close", () => {
      // Clean up
      this.object_list_geo = {};
      this.object_list_cart = {};
      this.connected = false;
      // Try to reconnect
      setTimeout(() => {
        if (this.verbose) {
          console.log("Attempting to reconnect to " + 
                      this.ip_address + ":" + this.port);
        }
        this.socket = new net.Socket();
        this.attempt_connection();
      }, 1000);
    });

    this.socket.connect(this.port, this.ip_address, () => {
      console.log("Object listener connected to Qortex Server at ip address " + this.ip_address + " on port " + this.port + ".");
      this.connected = true;
    });
  }
}

module.exports = QortexObjectListener
