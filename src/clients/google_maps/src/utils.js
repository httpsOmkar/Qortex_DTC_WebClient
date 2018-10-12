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

class Utils {
  static degToRad(deg) {
    return (deg * (Math.PI / 180));
  }

  static radToDeg(rad) {
    return (rad * (180 / Math.PI));
  }

  static xyzToLatLng(originLat, originLng, originBearing, 
                  x, y, z) {
    let distance = Math.sqrt(x*x + y*y + z*z);
    let earthRadius = 6371000.0;
    let angular_distance = distance / earthRadius;
    let bearingOffset = Utils.degToRad(originBearing);
    let lat1 = Utils.degToRad(originLat);
    let lng1 = Utils.degToRad(originLng);
    let bearing = bearingOffset + Math.atan2(y, x);

    let lat2 = Math.asin((Math.sin(lat1) *
                         Math.cos(angular_distance)) +
                        (Math.cos(lat1) *
                         Math.sin(angular_distance) *
                         Math.cos(bearing)));
    let lng2 = lng1 +
              Math.atan2((Math.sin(bearing) * 
                          Math.sin(angular_distance) *
                          Math.cos(lat1)),
                         (Math.cos(angular_distance) -
                          (Math.sin(lat1) *
                           Math.sin(lat2))));
    lat2 = Utils.radToDeg(lat2);
    lng2 = Utils.radToDeg(lng2); 
    
    return { lat: lat2, lng: lng2 };
  }
}
