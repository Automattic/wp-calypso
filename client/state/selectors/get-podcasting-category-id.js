/**
 * Internal dependencies
 */
import { get } from 'lodash';
import isPrivateSite from 'calypso/state/selectors/is-private-site';

import 'calypso/state/site-settings/init';

/**
 * Returns the Podcasting category ID for a given site ID.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {number}          Category ID or null if not found
 */
export default function getPodcastingCategoryId( state, siteId ) {
	if ( isPrivateSite( state, siteId ) ) {
		// Podcasting relies on the RSS feed being public, so it is disabled on
		// private sites.
		return null;
	}

	return get( state.siteSettings.items, [ siteId, 'podcasting_category_id' ], null );
}
