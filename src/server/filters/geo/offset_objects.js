function filter(data, configs)
{
  if (configs == undefined)
  {
    return data;
  }

  let objects = data.objects;

  for (obj_id in objects)
  {
    objects[obj_id].lat += Number(configs.lat_offset);
    objects[obj_id].lng += Number(configs.lng_offset);
    objects[obj_id].heading += Number(configs.heading_offset);
  }

  return data;
}

module.exports = {
  name: "offset_objects",
  filter: filter
};
