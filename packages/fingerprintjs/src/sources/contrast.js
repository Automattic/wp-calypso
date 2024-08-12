'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see https://www.w3.org/TR/mediaqueries-5/#prefers-contrast
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
 */
function getContrastPreference() {
	if ( doesMatch( 'no-preference' ) ) {
		return 0 /* ContrastPreference.None */;
	}
	// The sources contradict on the keywords. Probably 'high' and 'low' will never be implemented.
	// Need to check it when all browsers implement the feature.
	if ( doesMatch( 'high' ) || doesMatch( 'more' ) ) {
		return 1 /* ContrastPreference.More */;
	}
	if ( doesMatch( 'low' ) || doesMatch( 'less' ) ) {
		return -1 /* ContrastPreference.Less */;
	}
	if ( doesMatch( 'forced' ) ) {
		return 10 /* ContrastPreference.ForcedColors */;
	}
	return undefined;
}
exports.default = getContrastPreference;
function doesMatch( value ) {
	return matchMedia( '(prefers-contrast: '.concat( value, ')' ) ).matches;
}
