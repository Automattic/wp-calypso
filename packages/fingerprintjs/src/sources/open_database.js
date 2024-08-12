'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
function getOpenDatabase() {
	return !! window.openDatabase;
}
exports.default = getOpenDatabase;
