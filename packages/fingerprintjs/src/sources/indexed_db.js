'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var browser_1 = require( '../utils/browser' );
function getIndexedDB() {
	// IE and Edge don't allow accessing indexedDB in private mode, therefore IE and Edge will have different
	// visitor identifier in normal and private modes.
	if ( ( 0, browser_1.isTrident )() || ( 0, browser_1.isEdgeHTML )() ) {
		return undefined;
	}
	try {
		return !! window.indexedDB;
	} catch ( e ) {
		/* SecurityError when referencing it means it exists */
		return true;
	}
}
exports.default = getIndexedDB;
