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

const symbolScale = 4;
const symbolLabelOrigin = {x: 0, y: -3};

let Symbols = {}
Symbols.customOutline = function(color, type) {
  let symbol = Symbols[type];
  symbol.strokeColor = color;
  return symbol;
}
Object.defineProperty(Symbols, "UNIDENTIFIED", {
  value: {
    fillColor: "#b3b3b3",
    fillOpacity: 1,
    labelOrigin: symbolLabelOrigin,
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "#595959",
    strokeOpacity: 1,
    strokeWeight: symbolScale/3,
    scale: symbolScale
  },
  writable: false,
  enumerable: true,
  configurable: false
});
Object.defineProperty(Symbols, "IGNORED", {
  value: {
    fillColor: "#b3b3b3",
    fillOpacity: 1,
    labelOrigin: symbolLabelOrigin,
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "#595959",
    strokeOpacity: 1,
    strokeWeight: symbolScale/6,
    scale: symbolScale/2
  },
  writable: false,
  enumerable: true,
  configurable: false
});
Object.defineProperty(Symbols, "HUMAN", {
  value: {
    fillColor: "#66ff66",
    fillOpacity: 1,
    labelOrigin: symbolLabelOrigin,
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "#33cc33",
    strokeOpacity: 1,
    strokeWeight: symbolScale/3,
    scale: symbolScale
  },
  writable: false,
  enumerable: true,
  configurable: false
});
Object.defineProperty(Symbols, "VEHICLE", {
  value: {
    fillColor: "#ff66b3",
    fillOpacity: 1,
    labelOrigin: symbolLabelOrigin,
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "#b30049",
    strokeOpacity: 1,
    strokeWeight: symbolScale/3,
    scale: symbolScale
  },
  writable: false,
  enumerable: true,
  configurable: false
});
Object.defineProperty(Symbols, "LIDAR", {
  value: {
    fillColor: "#0066ff",
    fillOpacity: 1,
    labelOrigin: symbolLabelOrigin,
    path: google.maps.SymbolPath.CIRCLE,
    strokeColor: "#6699ff",
    strokeOpacity: 1,
    strokeWeight: symbolScale/3,
    scale: symbolScale
  },
  writable: false,
  enumerable: true,
  configuration: false
});
