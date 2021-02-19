/**
 * External dependencies
 */
import impureLodash from 'calypso/lib/impure-lodash';

const { uniqueId } = impureLodash;

/**
 * Returns an ID for transient media items. To be consistent in creating
 * transient media IDs they are all prefixed with 'media-'
 *
 * @param {string} moreSpecificPrefix can be used to further specify the prefix
 */
export function createTransientMediaId( moreSpecificPrefix = '' ) {
	return uniqueId( `media-${ moreSpecificPrefix }` );
}
