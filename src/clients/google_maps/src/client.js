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

function updateHideDebugTracks(mapData) {
  let hideDebugInput = document.getElementById("hide-debug-tracks");
  let hideDebugTracks = hideDebugInput.checked;
  mapData.updateHideDebugTracks(hideDebugTracks);
}

function attachListeners(mapData) {
  let hideDebugInput = document.getElementById("hide-debug-tracks");
  hideDebugInput.addEventListener("input", () => {
    updateHideDebugTracks(mapData);
  });
}

//====================================================//
// TODO: refactor all of these HTML Element creation  //
//       functions into another file, or use a        //
//       proper framework like React.                 //
//====================================================//

function getServerStatuses(statusList) {
  return statusList.getElementsByTagName("li");
}

function removeClassFromComponent(component, className) {
  let pattern = new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g');
  component.className = component.className.replace(pattern, "");
}

function componentHasClass(component, className) {
  let pattern = new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g');
  return component.className.match(pattern);
}

function setConnectionStatusText(connectionStatusText, connected) {
  let text = connected ? "Connected" : "Disconnected";
  connectionStatusText.innerHTML = text;

  if (connected) {
    if (componentHasClass(connectionStatusText, "red-text")) {
      removeClassFromComponent(connectionStatusText, "red-text");
    }

    if (!componentHasClass(connectionStatusText, "green-text")) {
      connectionStatusText.className += " green-text";
    }
  }
  else {
    if (componentHasClass(connectionStatusText, "green-text")) {
      removeClassFromComponent(connectionStatusText, "green-text");
    }

    if (!componentHasClass(connectionStatusText, "red-text")) {
      connectionStatusText.className += " red-text";
    }
  }
}

function setTimestampText(timestampText, timestamp) {
  let text;
  if (timestamp == 0) {
    text = "N/A";

    if (componentHasClass(timestampText, "green-text")) {
      removeClassFromComponent(timestampText, "green-text");
    }

    if (!componentHasClass(timestampText, "red-txt")) {
      timestampText.className += " red-text";
    }
  }
  else {
    text = (new Date(timestamp)).toString();

    if (Date.now() - timestamp >= 1000) {
      if (componentHasClass(timestampText, "green-text")) {
        removeClassFromComponent(timestampText, "green-text");
      }

      if (!componentHasClass(timestampText, "red-text")) {
        timestampText.className += " red-text";
      }
    }
    else {
      if (componentHasClass(timestampText, "red-text")) {
        removeClassFromComponent(timestampText, "red-text");
      }

      if (!componentHasClass(timestampText, "green-text")) {
        timestampText.className += " green-text";
      }
    }
  }

  timestampText.innerHTML = text;
}


function createLastReceivedPacketComponent(serverName,
                                           timestamp) {
  let timestampLabel = document.createElement("p");
  timestampLabel.className += "server-status-label";
  timestampLabel.innerHTML = "Last Received Packet:";

  let timestampText = document.createElement("p");
  timestampText.className += "server-status-text";
  setTimestampText(timestampText, timestamp);

  let timestampContainer = document.createElement("div");
  timestampContainer.className += "server-status-container";
  timestampContainer.id = serverName + "-timestamp-container";

  timestampContainer.appendChild(timestampLabel);
  timestampContainer.appendChild(timestampText);

  return timestampContainer;
}

function createConnectionStatusComponent(serverName,
                                         connected) {
  let connectedLabel = document.createElement("p");
  connectedLabel.className += "server-status-label";
  connectedLabel.innerHTML = "Connection Status:";

  let connectionStatusText = document.createElement("p");
  connectionStatusText.className += "server-status-text";
  setConnectionStatusText(connectionStatusText, connected);

  let connectedContainer = document.createElement("div");
  connectedContainer.className += "server-status-container";
  connectedContainer.id = serverName +
                          "-connection-status-container";

  connectedContainer.appendChild(connectedLabel);
  connectedContainer.appendChild(connectionStatusText);

  return connectedContainer;
}

function createServerStatusListItem(serverName,
                                    connected,
                                    timestamp) {
  let connectedComponent = createConnectionStatusComponent(
    serverName,
    connected);

  let lastReceivedPacketComponent = createLastReceivedPacketComponent(
    serverName,
    timestamp);

  let serverNameLabel = document.createElement("p");
  serverNameLabel.className += "server-name-label";
  serverNameLabel.innerHTML = serverName;

  let listItem = document.createElement("li");
  listItem.className += "server-status-list-item";
  listItem.id = serverName + "-status-list-item";

  listItem.appendChild(serverNameLabel);
  listItem.appendChild(connectedComponent);
  listItem.appendChild(lastReceivedPacketComponent);

  return listItem;
}

//======================================================//
//The server name functions assume that the structure
// of the html is as follows:
// <li>
//  <container div>
//    <p>Name</p>
//  </div>
// </li>
// If the markup structure is ever changed, make
// sure to update both functions
function getServerNameFromListItem(listItem) {
  return listItem.children[0].innerHTML;
}

function setServerNameInListItem(listItem, name) {
  listItem.children[0].innerHTML = name;
}

//======================================================//

function updateServerStatusComponent(component,
                                     connected,
                                     timestamp) {
  let connectedContainer = component.children[1];
  let connectedStr = connected ? "Connected" : "Disconnected";
  let connectionStatusText = connectedContainer.children[1];
  setConnectionStatusText(connectionStatusText, connected);

  let timestampContainer = component.children[2];
  let timestampText = timestampContainer.children[1];
  setTimestampText(timestampText, timestamp);
}

//========================================//
// End of HTML Element creation functions //
//========================================//

function updateServerStatuses(message) {
  let statusList = document.getElementById("server-statuses-list");
  let serverStatuses = getServerStatuses(statusList);
  let serverList = {};
  for (let i=0; i<serverStatuses.length; i++) {
    serverList[getServerNameFromListItem(serverStatuses[i])] = i;
  }

  for (let idx in message) {
    if (serverList[message[idx].info.name] != undefined) {
      let serverIndex = serverList[message[idx].info.name];
      let serverStatus = serverStatuses[serverIndex];
      let connected = message[idx].info.connected;
      let timestamp = message[idx].info.timestamp;

      updateServerStatusComponent(serverStatus, connected, timestamp);
    }
    else {
      let name = message[idx].info.name;
      let connected = message[idx].info.connected;
      let timestamp = message[idx].info.timestamp;
      let serverStatusComponent = createServerStatusListItem(
        name, connected, timestamp);

      statusList.appendChild(serverStatusComponent);
    }
  }
}

function start() {
  let mapData = new MapData(0, 0);
  updateHideDebugTracks(mapData);
  attachListeners(mapData);

  // Fetch object list
  let fetchObjects = () => {
    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
      if (ajax.readyState == 4 &&
          ajax.status == 200) {
        let message = JSON.parse(ajax.responseText);
        mapData.update(message);

        updateServerStatuses(message);
      }
      else {
        /*
        console.log(ajax.readyState);
        console.log("");
        */
      }
    };
    ajax.onerror = () => {
      mapData.clear();
    };

    ajax.open("GET", "/api/object_list/geo");
    ajax.send();
  };
  fetchObjects();
  setInterval(fetchObjects, 100);
}
