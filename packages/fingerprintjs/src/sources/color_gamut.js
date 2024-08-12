'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut
 */
function getColorGamut() {
	// rec2020 includes p3 and p3 includes srgb
	for ( var _i = 0, _a = [ 'rec2020', 'p3', 'srgb' ]; _i < _a.length; _i++ ) {
		var gamut = _a[ _i ];
		if ( matchMedia( '(color-gamut: '.concat( gamut, ')' ) ).matches ) {
			return gamut;
		}
	}
	return undefined;
}
exports.default = getColorGamut;
