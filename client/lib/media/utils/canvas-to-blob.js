/**
 * Wrapper method for the HTML canvas toBlob() function. Polyfills if the
 * function does not exist
 *
 * @param {object} canvas the canvas element
 * @param {Function} callback function to process the blob after it is extracted
 * @param {string} type image type to be extracted
 * @param {number} quality extracted image quality
 */
export function canvasToBlob( canvas, callback, type, quality ) {
	const { HTMLCanvasElement, Blob, atob } = window;

	if ( ! HTMLCanvasElement.prototype.toBlob ) {
		Object.defineProperty( HTMLCanvasElement.prototype, 'toBlob', {
			value: function ( polyfillCallback, polyfillType, polyfillQuality ) {
				const binStr = atob( this.toDataURL( polyfillType, polyfillQuality ).split( ',' )[ 1 ] );
				const len = binStr.length;
				const arr = new Uint8Array( len );

				for ( let i = 0; i < len; i++ ) {
					arr[ i ] = binStr.charCodeAt( i );
				}

				polyfillCallback(
					new Blob( [ arr ], {
						type: polyfillType || 'image/png',
					} )
				);
			},
		} );
	}

	canvas.toBlob( callback, type, quality );
}
