import { includes } from 'lodash';
import { getMimeType } from 'calypso/lib/media/utils/get-mime-type';

/**
 * Returns true if the specified item exceeds the maximum upload size for
 * the given site. Returns null if the bytes are invalid, the max upload
 * size for the site is unknown or a video is being uploaded for a Jetpack
 * site with VideoPress enabled. Otherwise, returns true.
 * @param  {Object}   item  Media object
 * @param  {Object}   site  Site object
 * @returns {?boolean}       Whether the size exceeds the site maximum
 */
export function isExceedingSiteMaxUploadSize( item, site ) {
	const bytes = item.size;

	if ( ! site || ! site.options ) {
		return null;
	}

	if ( ! isFinite( bytes ) || ! site.options.max_upload_size ) {
		return null;
	}

	if (
		site.jetpack &&
		includes( site?.options?.active_modules, 'videopress' ) &&
		( getMimeType( item ) ?? '' ).startsWith( 'video/' )
	) {
		return null;
	}

	return bytes > site.options.max_upload_size;
}
