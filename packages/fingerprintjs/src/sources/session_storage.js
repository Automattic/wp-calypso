'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
function getSessionStorage() {
	try {
		return !! window.sessionStorage;
	} catch ( error ) {
		/* SecurityError when referencing it means it exists */
		return true;
	}
}
exports.default = getSessionStorage;
