'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
 */
function areColorsForced() {
	if ( doesMatch( 'active' ) ) {
		return true;
	}
	if ( doesMatch( 'none' ) ) {
		return false;
	}
	return undefined;
}
exports.default = areColorsForced;
function doesMatch( value ) {
	return matchMedia( '(forced-colors: '.concat( value, ')' ) ).matches;
}
