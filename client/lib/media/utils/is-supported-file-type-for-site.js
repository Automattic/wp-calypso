/**
 * Internal dependencies
 */
import { isSiteAllowedFileTypesToBeTrusted } from 'calypso/lib/media/utils/is-site-allowed-file-types-to-be-trusted';
import { getAllowedFileTypesForSite } from 'calypso/lib/media/utils/get-allowed-file-types-for-site';

/**
 * Returns true if the specified item is a valid file for the given site,
 * or false otherwise. A file is valid if the sites allowable file types
 * contains the item's type.
 *
 * @param  {object}  item Media object
 * @param  {object}  site Site object
 * @returns {boolean}      Whether the site supports the item
 */
export function isSupportedFileTypeForSite( item, site ) {
	if ( ! site || ! item ) {
		return false;
	}

	if ( ! isSiteAllowedFileTypesToBeTrusted( site ) ) {
		return true;
	}

	return getAllowedFileTypesForSite( site ).some( function ( allowed ) {
		return allowed.toLowerCase() === item.extension.toLowerCase();
	} );
}
