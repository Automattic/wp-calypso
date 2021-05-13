/**
 * External dependencies
 */
import photon from 'photon';

/**
 * Internal dependencies
 */
import resize from 'calypso/lib/resize-image-url';

/**
 * Given a media object, returns a URL string to that media. Accepts
 * optional options to specify photon usage or a maximum image width.
 *
 * @param  {object} media   Media object
 * @param  {object} options Optional options, accepting a `photon` boolean,
 *                          `maxWidth` pixel value, `resize` string, or `size`.
 * @returns {string}         URL to the media
 */
export function url( media, options ) {
	if ( ! media ) {
		return;
	}

	if ( media.transient ) {
		return media.URL;
	}

	// We've found that some media can be corrupt with an unusable URL.
	// Return early so attempts to parse the URL don't result in an error.
	if ( ! media.URL ) {
		return;
	}

	options = options || {};

	if ( options.photon ) {
		if ( options.maxWidth ) {
			return photon( media.URL, { width: options.maxWidth } );
		}
		if ( options.resize ) {
			return photon( media.URL, { resize: options.resize } );
		}

		return photon( media.URL );
	}

	if ( media.thumbnails && options.size in media.thumbnails ) {
		return media.thumbnails[ options.size ];
	}

	if ( options.maxWidth ) {
		return resize( media.URL, {
			w: options.maxWidth,
		} );
	}

	if ( options.resize ) {
		return resize( media.URL, {
			resize: options.resize,
		} );
	}

	return media.URL;
}
