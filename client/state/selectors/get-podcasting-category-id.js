/** @format */

/**
 * Internal dependencies
 */
import { get } from 'lodash';

/**
 * Returns the Podcasting category ID for a given site ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Number}          Category ID or null if not found
 */
export default function getPodcastingCategoryId( state, siteId ) {
	return get( state.siteSettings.items, [ siteId, 'podcasting_category_id' ], null );
}
