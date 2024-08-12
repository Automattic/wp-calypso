'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var browser_1 = require( '../utils/browser' );
function getLanguages() {
	var n = navigator;
	var result = [];
	var language = n.language || n.userLanguage || n.browserLanguage || n.systemLanguage;
	if ( language !== undefined ) {
		result.push( [ language ] );
	}
	if ( Array.isArray( n.languages ) ) {
		// Starting from Chromium 86, there is only a single value in `navigator.language` in Incognito mode:
		// the value of `navigator.language`. Therefore the value is ignored in this browser.
		if ( ! ( ( 0, browser_1.isChromium )() && ( 0, browser_1.isChromium86OrNewer )() ) ) {
			result.push( n.languages );
		}
	} else if ( typeof n.languages === 'string' ) {
		var languages = n.languages;
		if ( languages ) {
			result.push( languages.split( ',' ) );
		}
	}
	return result;
}
exports.default = getLanguages;
