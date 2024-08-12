'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see https://www.w3.org/TR/mediaqueries-5/#dynamic-range
 */
function isHDR() {
	if ( doesMatch( 'high' ) ) {
		return true;
	}
	if ( doesMatch( 'standard' ) ) {
		return false;
	}
	return undefined;
}
exports.default = isHDR;
function doesMatch( value ) {
	return matchMedia( '(dynamic-range: '.concat( value, ')' ) ).matches;
}
