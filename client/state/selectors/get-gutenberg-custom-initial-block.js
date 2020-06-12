/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/gutenberg-custom-initial-block/init';

/**
 * Returns the custom initial block of the selected site, if any.
 *
 * @param {object} state Global state tree.
 * @param {number} siteId Site ID.
 * @returns {string} The custom initial block of the selected site.
 */
export default function getGutenbergCustomInitialBlock( state, siteId ) {
	return get( state, [ 'gutenbergCustomInitialBlock', siteId ], null );
}
