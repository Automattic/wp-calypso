/**
 * Internal dependencies
 */
import { get } from 'lodash';
import isPrivateSite from 'state/selectors/is-private-site';

/**
 * Returns the Podcasting category ID for a given site ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Number}          Category ID or null if not found
 */
export default function getPodcastingCategoryId( state, siteId ) {
	if ( isPrivateSite( state, siteId ) ) {
		// Podcasting relies on the RSS feed being public, so it is disabled on
		// private sites.
		return null;
	}

	return get( state.siteSettings.items, [ siteId, 'podcasting_category_id' ], null );
}
