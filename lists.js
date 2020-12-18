function makeItem(template, map, parent) {
  if (parent === undefined) { parent = "DIV"; }
  let newItem = document.createElement(parent);
  template.match(/{.*?}/g).forEach(function (value) {
    template = template.replace(value, map[value.slice(1, -1)]);
  });
  newItem.innerHTML = template;
  return newItem.firstChild;
}