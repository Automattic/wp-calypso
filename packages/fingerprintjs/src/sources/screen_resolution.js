'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var data_1 = require( '../utils/data' );
function getScreenResolution() {
	var s = screen;
	// Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
	// I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
	// Some browsers even return  screen resolution as not numbers.
	var parseDimension = function ( value ) {
		return ( 0, data_1.replaceNaN )( ( 0, data_1.toInt )( value ), null );
	};
	var dimensions = [ parseDimension( s.width ), parseDimension( s.height ) ];
	dimensions.sort().reverse();
	return dimensions;
}
exports.default = getScreenResolution;
