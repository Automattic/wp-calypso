/**
 * Internal dependencies
 */
import { VideoPressFileTypes } from 'calypso/lib/media/constants';
import { isSiteAllowedFileTypesToBeTrusted } from 'calypso/lib/media/utils/is-site-allowed-file-types-to-be-trusted';

/**
 * Returns true if the specified item is a valid file in a Premium plan,
 * or false otherwise.
 *
 * @param  {object}  item Media object
 * @param  {object}  site Site object
 * @returns {boolean}      Whether the Premium plan supports the item
 */
export function isSupportedFileTypeInPremium( item, site ) {
	if ( ! site || ! item ) {
		return false;
	}

	if ( ! isSiteAllowedFileTypesToBeTrusted( site ) ) {
		return true;
	}

	return VideoPressFileTypes.some( function ( allowed ) {
		return allowed.toLowerCase() === item.extension.toLowerCase();
	} );
}
