'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var data_1 = require( '../utils/data' );
function getHardwareConcurrency() {
	// sometimes hardware concurrency is a string
	return ( 0, data_1.replaceNaN )(
		( 0, data_1.toInt )( navigator.hardwareConcurrency ),
		undefined
	);
}
exports.default = getHardwareConcurrency;
