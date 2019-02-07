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
let path = require("path");
let process = require("process");
let Server = require("./server.js");

let version = "0.3.2";

function parse_args() {
  let config_filepath = path.resolve(
    __dirname + "./../../../config/config.ini");
  let port = 3000;
  let save_logs = false;

  let args = process.argv.slice(2);
  for (let i=0; i<args.length; ++i) {
    if (args[i] == "-h" || args[i] == "--help") {
      console.log();
      console.log("Usage:", "node main.js [options]");
      console.log("Options:");
      console.log("  -h, --help", "            ",
                  "  ",
                  "Print this message");
      console.log("  -l, --log", "             ",
                  "  ",
                  "Whether or not to save JSON data from the Qortex\n",
                  "                            ",
                  "server to file. Defaults to false.");
      console.log("  -p, --port <port>", "     ",
                  "  ",
                  "The port to run the server on.\n",
                  "                            ",
                  "Defaults to PORT set in the environment, or 3000\n",
                  "                            ",
                  "if there is no PORT set");
      console.log("  -c, --config <filepath>",
                  "  ",
                  "The filepath to the config file.\n",
                  "                            ",
                  "Defaults to 'config/config.ini' from the Qortex\n",
                  "                            ",
                  "DTC Web Client root directory");
      console.log();

      // Exit normally
      return undefined;
    }
    else if (args[i] == "-l" || args[i] == "--log")
    {
      save_logs = true;
    }
    else if ((args[i] == "-p" || args[i] == "--port")
          && (i+1 < args.length)) {
      port = Number(args[i+1]);
      if (isNaN(port))
      {
        console.log("Invalid argument: port is not a number");
        console.log();

        process.exitCode = 1;
        return undefined;
      }

      ++i;
    }
    else if ((args[i] == "-c" || args[i] == "--config")
          && (i+1 < args.length)) {
      config_filepath = args[i+1];
      if (!path.isAbsolute(config_filepath))
      {
        config_filepath = process.cwd() + "/" + config_filepath;
      }
      ++i;
    }
  }

  return {
    port: port,
    config_filepath: config_filepath,
    save_logs: save_logs
  };
}

let args = parse_args();
if (args)
{
  console.log("Qortex DTC Web Client v" + version + "\n");
  let server = new Server(
    process.env.PORT || args.port,
    args.save_logs,
    args.config_filepath);

  server.start();
}
