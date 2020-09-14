/**
 * External dependencies
 */
import impureLodash from 'lib/impure-lodash';

const { uniqueId } = impureLodash;

/**
 * Returns an ID for transient media items. To be consistent in creating
 * transient media IDs they are all prefixed with 'media-'
 *
 * @param {string} moreSpecifiedPrefix can be used to further specify the prefix
 */
function createTransientMediaId( moreSpecifiedPrefix = '' ) {
	return uniqueId( `media-${ moreSpecifiedPrefix }` );
}

export default createTransientMediaId;
