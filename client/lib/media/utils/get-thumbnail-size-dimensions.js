/**
 * Internal dependencies
 */
import { ThumbnailSizeDimensions } from 'calypso/lib/media/constants';

/**
 * Returns an object containing width and height dimenions in pixels for
 * the thumbnail size, optionally for a given site. If the size cannot be
 * determined or a site is not passed, a fallback default value is used.
 *
 * @param  {string} size Thumbnail size
 * @param  {object} site Site object
 * @returns {object}      Width and height dimensions
 */
export function getThumbnailSizeDimensions( size, site ) {
	let width;
	let height;

	if ( site && site.options ) {
		width = site.options[ 'image_' + size + '_width' ];
		height = site.options[ 'image_' + size + '_height' ];
	}

	if ( size in ThumbnailSizeDimensions ) {
		width = width || ThumbnailSizeDimensions[ size ].width;
		height = height || ThumbnailSizeDimensions[ size ].height;
	}

	return { width, height };
}
