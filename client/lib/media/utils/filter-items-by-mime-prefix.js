/**
 * Internal dependencies
 */
import { getMimePrefix } from 'calypso/lib/media/utils/get-mime-prefix';

/**
 * Given an array of media objects, returns a filtered array composed of
 * items from the original array matching the specified mime prefix.
 *
 * @param  {Array}  items      Array of media objects
 * @param  {string} mimePrefix A mime prefix, e.g. "image"
 * @returns {Array}             Filtered array of matching media objects
 */
export function filterItemsByMimePrefix( items, mimePrefix ) {
	return items.filter( function ( item ) {
		return getMimePrefix( item ) === mimePrefix;
	} );
}
