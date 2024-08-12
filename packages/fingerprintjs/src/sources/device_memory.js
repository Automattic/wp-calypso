'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var data_1 = require( '../utils/data' );
function getDeviceMemory() {
	// `navigator.deviceMemory` is a string containing a number in some unidentified cases
	return ( 0, data_1.replaceNaN )( ( 0, data_1.toFloat )( navigator.deviceMemory ), undefined );
}
exports.default = getDeviceMemory;
