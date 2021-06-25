const Locator = function ( name, filename, pending, title ) {
	this.name = name;
	this.filename = filename;
	this.pending = pending;
	this.title = title;
};

Locator.prototype.toString = function () {
	return this.name;
};

module.exports = Locator;
