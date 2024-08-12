'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/inverted-colors
 */
function areColorsInverted() {
	if ( doesMatch( 'inverted' ) ) {
		return true;
	}
	if ( doesMatch( 'none' ) ) {
		return false;
	}
	return undefined;
}
exports.default = areColorsInverted;
function doesMatch( value ) {
	return matchMedia( '(inverted-colors: '.concat( value, ')' ) ).matches;
}
