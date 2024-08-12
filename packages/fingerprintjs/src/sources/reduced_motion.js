'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 */
function isMotionReduced() {
	if ( doesMatch( 'reduce' ) ) {
		return true;
	}
	if ( doesMatch( 'no-preference' ) ) {
		return false;
	}
	return undefined;
}
exports.default = isMotionReduced;
function doesMatch( value ) {
	return matchMedia( '(prefers-reduced-motion: '.concat( value, ')' ) ).matches;
}
