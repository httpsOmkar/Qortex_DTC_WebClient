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

class MapData {
  constructor(lat, lng) {
    this.center = new google.maps.LatLng(lat, lng);
    this.hideDebugTracks = true;
    this.sensorData = {};
    this.firstUpdate = true;

    this.map = new google.maps.Map(document.getElementById("map-canvas"), {
      zoom: 18,
      center: this.center,
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      rotateControl: true,
      rotateControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      streetViewControl: false
    });
  }

  update(sensorList) {
    for (let idx in sensorList) {
      let sensor = sensorList[idx];
      if (this.sensorData[sensor.info.name]) {
        this.sensorData[sensor.info.name].update(sensor.objects);
      }
      else {
        this.sensorData[sensor.info.name] = new SensorData(
          sensor.info.name, sensor.info.display_color,
          sensor.info.lat, sensor.info.lng, sensor.info.heading,
          this.map,
          this.hideDebugTracks);
      }
    }

    if (this.firstUpdate) {
      let sensorNames = Object.keys(this.sensorData);
      let firstSensor = sensorNames[0];
      let center = this.sensorData[firstSensor].center;
      this.updateCenter(center.lat(), center.lng());
      this.firstUpdate = false;
    }
  }

  clear() {
    for (let name in this.sensorData) {
      this.sensorData[name].clear();
    }
  }

  updateCenter(lat, lng) {
    this.center = new google.maps.LatLng(lat, lng);
    this.map.setCenter(this.center);
  }

  updateHideDebugTracks(hideDebugTracks) {
    this.hideDebugTracks = hideDebugTracks;

    for (let name in this.sensorData) {
      this.sensorData[name].updateHideDebugTracks(this.hideDebugTracks);
    }
  }
}
