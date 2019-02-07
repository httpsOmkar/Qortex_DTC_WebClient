## Table of Contents

- [Install Prerequisites](#install-prerequisites)
- [Web Client Preparation](#web-client-preparation)
- [Web Server Preparation](#web-server-preparation)
- [Configuring the Web Server](#configuring-the-web-server)
- [Running the Web Server](#running-the-web-server)
- [Using the HTTP REST API](#using-the-http-rest-api)
- [Adding Filters](#adding-filters)
- [Configuring Filters](#configuring-filters)

### Pre-deployment Preparation

<a name="install-prerequisites"/>

#### Install Prerequisites

- Install node.js
  - NVM (Node Version Manager) is an easy way to install and maintain a node.js installation
  - Instructions on how to install NVM can be found at https://github.com/creationix/nvm#installation
  - To install node.js through NVM, refer to https://github.com/creationix/nvm#usage
  - If you install through a package manager like apt, make sure that you are installing node.js, and not another program with the name node (apt-get has a package named node which is not node.js)
  - Qortex DTC Web Client was tested on Node.js v9.1.0
- If you wish to use the included google maps visualization client, you will need to register a Google Maps API key
  - Instructions on how to get a Google Maps API Key can be found at https://developers.google.com/maps/documentation/javascript/get-api-key

<a name="web-client-preparation"/>

#### Web Client Preparation

- If you only wish to use the server and your own http client, you can skip this step
- If you wish to use the Google Maps web client that comes with the server, complete the following steps
  - Navigate to the `src/clients/google_maps` folder
  - (Optional) Run `npm install` to install babel node modules for translating and minifying code
  - Prepare the dist folder
    - The google maps client expects scripts to be in `src/clients/google_maps/dist`. To change this behavior, modify the `index.html` file
    - The package.json file comes with three scripts to use for preparing the dist folder. You can run the commands using `npm run`
      - ex. `npm run build`
    - The three commands included are:
      - ***build*** - This will translate the files in the `src` folder using babel's `env` preset, and then `minify` the code
      - ***build_debug*** - This will translate the files as above, but will **not** `minify` the files
      - ***deploy_linux*** - This will directly copy the files from the `src` folder into the `dist` folder when run from a bash terminal or terminal that accepts the same commands as bash
      - ***deploy_windows*** - This will directly copy the files from the `src` folder into the `dist` folder when run from the windows command prompt
    - All four commands above will create the `dist` folder if the folder does not yet exist
  - Open `index.html` in a text editor and replace the `<insert_your_key>` on the line `<script src="https://maps.googleapis.com/maps/api/js?key=<insert_your_key>&callback=initialize"></script>` with your Google Maps API key

<a name="web-server-preparation"/>

#### Web Server Preparation

- Navigate to the `src/server` folder
- Run `npm install` to install the required http node modules
- [Configure the server](#configuring-the-web-server)

<a name="configuring-the-web-server"/>

#### Configuring the Web Server

- You must provide a `config.ini` file to run the Qortex DTC Web Server
- The config file does not need to be named `config.ini`, but will be referred to with that name for simplicity
  - If the config file is not named `config.ini`, then you will need to pass the file to the server with the `-c` argument detailed [below](#running-the-web-server)
- The `config.ini` file has the following information:
  - The client to serve
    - This information is placed in the `[client]` section
      - ***type*** - The name of the client to be served by the server
        - The `index.html` file in `src/clients/<client-name>` will be served by the server
  - The Qortex server's ***name*** (indicated by `[servers.<Name>]`)
    - ***ip_address*** - The Qortex server's IP address
    - ***object_port*** - The port on which the Qortex server publishes objects
    - ***zone_port*** - The port on which the Qortex server publishes zones
    - The geographic calibration of the Qortex installation against the world *(optional)*
      - ***lat*** - The latitude of the Qortex installation in the world
      - ***lng*** - The longitude of the Qortex installation in the world
      - ***heading*** - The orientation of the Qortex installation in the world
    - The cartesian calibration of the Qortex installation against the world *(optional)*. These values will depend on the map you wish to display objects on.
      - ***x_position*** - The x position of the Qortex installation relative to some point
      - ***y_position*** - The y position of the Qortex installation relative to some point
      - ***z_position*** - The z position of the Qortex installation relative to some point
    - ***verbose*** - Whether or not to print messages to the console when the Qortex Server listeners fail to connect due to connection refused and when the listeners attempt reconnections **(This will fill your terminal with a stream of messages if the Qortex Server is unable to be reached, but can be helpful for diagnostics)**
    - You may have multiple servers in the `config.ini` file by adding multiple `[servers.<Name>]` sections. Each section will need the information listed above
    - If you do not provide geographic coordinates, then latitude, longitude, and heading are defaulted to 0
    - If you do not provide Cartesian coordinates, then x, y, and z are defaulted to 0

<a name="running-the-web-server"/>

#### Running the Web Server

- There is a shell script available in the `bin` folder that can be executed called `server.sh`. Alternatively, you can run `node` on `src/server/src/main.js`
- You can pass in the following options:
  - `-h` or `--help` to the get a full list of options
  - `-l` or `--log` to set whether or not the JSON data received from the Qortex Servers will be saved to file. Files will be saved to the `logs` folder in the Qortex DTC Web Client root folder
  - `-p` or `--port` to specify which port the Qortex DTC Web Client server will use for HTTP communications. It will default to the port set in the environment, or 3000 if such a port is not set
  - `-c` or `--config` to pass in the location of the config file
- The server will run until you stop the program using Ctrl+C

<a name="using-the-http-rest-api"/>

#### Using the HTTP REST API

- The Server will serve the following routes:
- GET /
  - This serves the web client specified in the `config.ini` file provided to the server
- GET /api/object_list/:type
  - This serves the object and zone data. Refer to [docs/SampleState.md](docs/SampleState.md) for an example of the data shape
- GET /*
  - This will attempt to serve any file in the client folder (located at `src/clients/<client-name>`) with the exception that anything in the src folder, the node_modules folder, the package.json file in the client folder, and the package-lock.json file in the client folder will not be served

<a name="adding-filters"/>

#### Adding Filters

- You can add custom filters to modify the object list to the Qortex DTC Web Client's server. These filters will receive the ***server information***, ***object list***, and ***information about any triggered zones***.
- You can define which filters you wish to use by placing a filters list next to the `config.ini` file
  - To add a filter to Cartesian data, supply a `cart_filters.txt` file
  - To add a filter to geodesic data, supply a `geo_filters.txt` file
  - The files should contain a list of filter names, with one filter name per line, in the order that you wish the filters to run.
  - Filters at the top of the list will be run before the filters at the bottom of the list
  - There are two example filter lists included in the `config` folder
- You can add your own filters by adding a `<filter-name>.js` file in the `src/server/filters/cart` or `src/server/filters/geo` folder
- Filters can have any amount of code, but must have the following interface:
- The function must have a signature of

  ```
  function <filter-entry-point-function>(data, configs)
  ```

- configs are read from the `config.ini` file and configuring filters will be described further [below](#configuring-filters)
- The following export code must be at the bottom

  ```
  module.exports = {
      name: <filter-name>,
      filter: <filter-entry-point-function>
  }
  ```

- The server expects the interface above, and will expect the filter to be runnable as a pure function which returns the modified data
- There are a few example filters already included in the [src/server/filters/cart](src/server/filters/cart) and [src/server/filters/geo](src/server/filters/geo) folders, and also two example filter lists in the [config](config) folder

<a name="configuring-filters"/>

#### Configuring filters

- Filters are configured through the `config.ini` file
- Similar to the Qortex Server configuration sections, there are filter configuration sections
- You will need to provide the ***name*** of the filter through the `[filters.cart.<filter-name>]` or `[filters.geo.<filter-name>]` section tags
- You will then need to add the various configuration settings as key-value pairs underneath that section
  - i.e.`<setting-name>=<setting-value>`
- There are a few examples of how to configure filters provided in the default [config.ini](config/config.ini) file
