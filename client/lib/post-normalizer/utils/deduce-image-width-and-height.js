/**
 * Attempts to determine the width and height of an image element by checking
 * the element's explicit dimensions, natural dimensions, or a `data-orig-size`
 * attribute (a comma-separated "width,height" string).
 *
 * @param {Object} image - An image element or image descriptor object.
 * @param {number} [image.width] - Explicit width property.
 * @param {number} [image.height] - Explicit height property.
 * @param {number} [image.naturalWidth] - Natural (intrinsic) width of the image element.
 * @param {number} [image.naturalHeight] - Natural (intrinsic) height of the image element.
 * @param {Object} [image.dataset] - Dataset object containing optional `origSize` attribute.
 * @param {string} [image.dataset.origSize] - Comma-separated "width,height" string.
 * @returns {{ width: number, height: number }|null} An object with `width` and `height`, or
 *   `null` if the dimensions cannot be determined.
 */
export function deduceImageWidthAndHeight( image ) {
	if ( image.height && image.width ) {
		return {
			height: image.height,
			width: image.width,
		};
	}
	if ( image.naturalHeight && image.naturalWidth ) {
		return {
			height: image.naturalHeight,
			width: image.naturalWidth,
		};
	}
	if ( image.dataset && image.dataset.origSize ) {
		const [ width, height ] = image.dataset.origSize.split( ',' ).map( Number );
		return {
			width,
			height,
		};
	}
	return null;
}
