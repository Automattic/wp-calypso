'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
// https://bugzilla.mozilla.org/show_bug.cgi?id=781447
function getLocalStorage() {
	try {
		return !! window.localStorage;
	} catch ( e ) {
		/* SecurityError when referencing it means it exists */
		return true;
	}
}
exports.default = getLocalStorage;
