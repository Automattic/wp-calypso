/**
 * External dependencies
 */
import { includes, startsWith, get } from 'lodash';

/**
 * Internal dependencies
 */
import versionCompare from 'calypso/lib/version-compare';
import { getMimeType } from 'calypso/lib/media/utils/get-mime-type';

/**
 * Returns true if the specified item exceeds the maximum upload size for
 * the given site. Returns null if the bytes are invalid, the max upload
 * size for the site is unknown or a video is being uploaded for a Jetpack
 * site with VideoPress enabled. Otherwise, returns true.
 *
 * @param  {object}   item  Media object
 * @param  {object}   site  Site object
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
		includes( get( site, 'options.active_modules' ), 'videopress' ) &&
		versionCompare( get( site, 'options.jetpack_version' ), '4.5', '>=' ) &&
		startsWith( getMimeType( item ), 'video/' )
	) {
		return null;
	}

	return bytes > site.options.max_upload_size;
}
