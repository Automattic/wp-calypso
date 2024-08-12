'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.errorToObject = void 0;
var tslib_1 = require( 'tslib' );
/**
 * Converts an error object to a plain object that can be used with `JSON.stringify`.
 * If you just run `JSON.stringify(error)`, you'll get `'{}'`.
 */
function errorToObject( error ) {
	var _a;
	return tslib_1.__assign(
		{
			name: error.name,
			message: error.message,
			stack: ( _a = error.stack ) === null || _a === void 0 ? void 0 : _a.split( '\n' ),
		},
		error
	);
}
exports.errorToObject = errorToObject;
