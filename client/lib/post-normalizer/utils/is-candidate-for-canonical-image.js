/**
 * Determines whether an image meets the minimum size requirements to be
 * considered as the canonical (representative) image for a post.
 *
 * An image qualifies when its width is at least 100 pixels and its total
 * area (width × height) is at least 7,500 square pixels (100 × 75).
 *
 * @param {Object|null|undefined} image - The image descriptor object to evaluate.
 * @param {number} image.width - The image's width in pixels.
 * @param {number} image.height - The image's height in pixels.
 * @returns {boolean} `true` if the image meets the minimum size requirements,
 *   `false` otherwise.
 */
export function isCandidateForCanonicalImage( image ) {
	if ( ! image ) {
		return false;
	}

	if ( image.width < 100 ) {
		return false;
	}

	if ( image.width * image.height < 100 * 75 ) {
		return false;
	}
	return true;
}
