/**
 * The pixels of the images a capture inlined, kept for the contrast measurement.
 *
 * The rasterizer fetches the framed blocks' images over CORS, so its copies can
 * be read back; the editor's own `<img>`s are mostly loaded without
 * `crossorigin`, and drawing one taints the canvas it is drawn to. The
 * measurement runs straight after the capture, and synchronously, so it takes
 * these rather than loading the image again.
 *
 * Kept small: a contrast reading needs the image's tones under a line of text,
 * not its detail, and the copies live as long as the elements they are keyed by.
 */

// Long enough an edge for a line of text to cover a few dozen pixels of a
// full-width hero.
export const PIXEL_LONG_EDGE = 256;

const URL_PATTERN = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;

interface ImagePixels {
	/** The URL the pixels were read from, so a copy outlived by a new image is not used. */
	url: string;
	canvas: HTMLCanvasElement;
}

const pixelsByElement = new WeakMap< Element, ImagePixels >();

/** The urls a computed `background-image` loads, in order. */
export const getBackgroundImageUrls = ( backgroundImage: string | undefined ): string[] =>
	Array.from( backgroundImage?.matchAll( URL_PATTERN ) ?? [] ).map( ( match ) => match[ 1 ] );

/**
 * A copy of the drawn image, scaled to at most `PIXEL_LONG_EDGE`, in a canvas
 * of the given document's.
 * @param source        What to copy: a canvas, image or bitmap already drawn.
 * @param width         Its width in pixels.
 * @param height        Its height in pixels.
 * @param ownerDocument The document to make the canvas in.
 * @returns The canvas, or `null` when there is no 2d context.
 */
export function drawScaledCopy(
	source: CanvasImageSource,
	width: number,
	height: number,
	ownerDocument: Document = document
): HTMLCanvasElement | null {
	const scale = Math.min( 1, PIXEL_LONG_EDGE / Math.max( width, height ) );
	const canvas = ownerDocument.createElement( 'canvas' );
	canvas.width = Math.max( 1, Math.round( width * scale ) );
	canvas.height = Math.max( 1, Math.round( height * scale ) );

	const context = canvas.getContext( '2d' );

	if ( ! context ) {
		return null;
	}

	context.drawImage( source, 0, 0, canvas.width, canvas.height );

	return canvas;
}

export function rememberImagePixels( element: Element, url: string, canvas: HTMLCanvasElement ) {
	pixelsByElement.set( element, { url, canvas } );
}

/** The kept copy of the element's image, if it is still of `url`. */
export function recallImagePixels( element: Element, url: string ): HTMLCanvasElement | null {
	const pixels = pixelsByElement.get( element );

	return pixels?.url === url ? pixels.canvas : null;
}

/** Forgets a kept copy. For tests. */
export function forgetImagePixels( element: Element ) {
	pixelsByElement.delete( element );
}
