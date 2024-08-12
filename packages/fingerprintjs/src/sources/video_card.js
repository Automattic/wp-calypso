'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
/**
 * @see Credits: https://stackoverflow.com/a/49267844
 */
function getVideoCard() {
	var _a;
	var canvas = document.createElement( 'canvas' );
	var gl =
		( _a = canvas.getContext( 'webgl' ) ) !== null && _a !== void 0
			? _a
			: canvas.getContext( 'experimental-webgl' );
	if ( gl && 'getExtension' in gl ) {
		var debugInfo = gl.getExtension( 'WEBGL_debug_renderer_info' );
		if ( debugInfo ) {
			return {
				vendor: ( gl.getParameter( debugInfo.UNMASKED_VENDOR_WEBGL ) || '' ).toString(),
				renderer: ( gl.getParameter( debugInfo.UNMASKED_RENDERER_WEBGL ) || '' ).toString(),
			};
		}
	}
	return undefined;
}
exports.default = getVideoCard;
