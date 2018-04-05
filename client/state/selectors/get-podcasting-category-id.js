/** @format */

/**
 * Internal dependencies
 */

import { getSiteOption } from 'state/sites/selectors';

/**
 * Returns the Podcasting category ID for a given site ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Number}          Category ID or null if not found
 */
export default function getPodcastingCategoryId( state, siteId ) {
	return getSiteOption( state, siteId, 'podcasting_category_id' );
}
