var Locator = function (name, filename, pending) {
  this.name = name;
  this.filename = filename;
  this.pending = pending;
};

Locator.prototype.toString = function () {
  return this.name;
};

module.exports = Locator;
