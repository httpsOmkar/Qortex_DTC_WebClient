#### Geodesic Coordinates (/api/object_list/geo)
Size and velocity are not in geodesic coordinates
```javascript
[
  {
    info:
    {
      name: <string>,
      display_color: <string>,
      connected: <boolean>,
      timestamp: <number>,
      lat: <number>,
      lng: <number>,
      heading: <number>
    },
    objects:
    [
      {
        id: <string>,
        lat: <number>,
        lng: <number>,
        heading: <number>,
        size:
        {
          x: <number>,
          y: <number>,
          z: <number>
        },
        velocity:
        {
          x: <number>,
          y: <number>,
          z: <number>
        },
        classification: <string>
      }
    ],
    zones: 
    [
      {
        uuid: <string>,
        timestamp: <string>,
        name: <string>,
        objectCount: <number>,
        objectIds:
        [
          <string>
        ],
        zMin: <number>,
        zMax: <number>,
        zoneClass: <string>,
        shape:
        {
          vertices:
          [
            {
              lat: <number>,
              lng: <number>,
              heading: <number>
            }
          ]
        }
      }
    ]
  }
]
```

#### Cartesian Coordinates (/api/object_list/cart)
```javascript
[
  {
    info:
    {
      name: <string>,
      display_color: <string>,
      connected: <boolean>,
      timestamp: <number>,
      lat: <number>,
      lng: <number>,
      heading: <number>
    },
    objects:
    [
      {
        id: <string>,
        position:
        {
          x: <number>,
          y: <number>,
          z: <number>
        }
        size:
        {
          x: <number>,
          y: <number>,
          z: <number>
        },
        velocity:
        {
          x: <number>,
          y: <number>,
          z: <number>
        },
        classification: <string>
      }
    ],
    zones:
    [
      {
        uuid: <string>,
        timestamp: <string>,
        name: <string>,
        objectCount: <number>,
        objectIds:
        [
          <string>
        ],
        zMin: <number>,
        zMax: <number>,
        zoneClass: <string>,
        shape:
        {
          vertices:
          [
            {
              x: <number>,
              y: <number>
            }
          ]
        }
      }
    ]
  }
]
```
