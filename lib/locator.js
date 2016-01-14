var Locator = function (name, filename) {
  this.name = name;
  this.filename = filename;
};

Locator.prototype.toString = function () {
  return this.name;
};
