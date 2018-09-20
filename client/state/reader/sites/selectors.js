/** @format */
/**
 * External Dependencies
 */
import { find } from 'lodash';

const DAY_IN_MILLIS = 24 * 60 * 1000 * 1000;

/**
 * Returns true if we should fetch the site
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The site ID
 * @return {Boolean}        Whether site should be fetched
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
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The site ID
 * @return {Object}        Site
 */

export function getSite( state, siteId ) {
	return state.reader.sites.items[ siteId ];
}

export function getSiteByFeedUrl( state, feedUrl ) {
	return find( state.reader.sites.items, { feed_URL: feedUrl } );
}
