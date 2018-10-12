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
  static deg_to_rad(deg) {
    return (deg * (Math.PI / 180));
  }

  static rad_to_deg(rad) {
    return (rad * (180 / Math.PI));
  }

  static xyz_to_geo(origin_lat, origin_lng, origin_bearing, 
                    x, y, z) {
    let distance = Math.sqrt(x*x + y*y + z*z);
    let earth_radius = 6371000.0;
    let angular_distance = distance / earth_radius;
    let bearing_offset = Utils.deg_to_rad(origin_bearing);
    let lat1 = Utils.deg_to_rad(origin_lat);
    let lng1 = Utils.deg_to_rad(origin_lng);
    let bearing = bearing_offset + Math.atan2(y, x);

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
    lat2 = Utils.rad_to_deg(lat2);
    lng2 = Utils.rad_to_deg(lng2); 
    
    return { lat: lat2, lng: lng2, bearing: bearing };
  }
}

module.exports = Utils;
