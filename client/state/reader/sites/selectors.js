/**
 * External Dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

const DAY_IN_MILLIS = 24 * 60 * 1000 * 1000;

/**
 * Returns true if we should fetch the site
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The site ID
 * @returns {boolean}        Whether site should be fetched
 */

export function shouldSiteBeFetched( state, siteId ) {
	const isNotQueued = ! state.reader.sites.queuedRequests[ siteId ];
	const isMissing = ! getSite( state, siteId );
	return isNotQueued && ( isMissing || isStale( state, siteId ) );
}

function isStale( state, siteId ) {
	const lastFetched = state.reader.sites.lastFetched[ siteId ];
	if ( ! lastFetched ) {
		return true;
	}
	return lastFetched <= Date.now() - DAY_IN_MILLIS;
}

/**
 * Returns a site object
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The site ID
 * @returns {object}        Site
 */

export function getSite( state, siteId ) {
	return state.reader.sites.items[ siteId ];
}

export function getSiteByFeedUrl( state, feedUrl ) {
	return find( state.reader.sites.items, { feed_URL: feedUrl } );
}
