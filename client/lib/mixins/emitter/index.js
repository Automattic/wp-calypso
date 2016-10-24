// Here we make sure we’re not using Node’s core events module,
// because it contains a `domain` property and it clashes with our
// `Site` module that also has the same property.
//
// By adding a slash we force `require` to go into directory mode and to
// load the module from `node_modules/` instead of the core’s `events.js`
// file. Webpack uses the same module on the client side, too, which
// makes for a nice consistency.
var EventEmitter = require( 'events/' ).EventEmitter,
	assign = require( 'lodash/assign' );

module.exports = function( prototype ) {
	assign( prototype, EventEmitter.prototype );
	prototype.emitChange = function() {
		this.emit( 'change' );
	};
	prototype.off = prototype.removeListener;
};
