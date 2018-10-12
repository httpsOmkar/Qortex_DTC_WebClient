function filter(data, configs)
{
  if (configs == undefined)
  {
    return;
  }

  let objects = data.objects;

  for (obj_id in objects)
  {
    objects[obj_id].position.x += Number(configs.x_offset);
    objects[obj_id].position.y += Number(configs.y_offset);
    objects[obj_id].position.z += Number(configs.z_offset);
  }

  console.log("Cart offset objects");
  return data;
}

module.exports = {
  name: "offset_objects",
  filter: filter
}
