import { find } from 'lodash';
import { prepareComparableUrl } from 'calypso/state/reader/follows/utils';

import 'calypso/state/reader/init';

const DAY_IN_MILLIS = 24 * 60 * 1000 * 1000;

/**
 * Returns true if we should fetch the site
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId The site ID
 * @returns {boolean}        Whether site should be fetched
 */

export function shouldSiteBeFetched( state, siteId ) {
	const isNotQueued = ! state.reader.sites.queuedRequests[ siteId ];
	const isMissing = ! getSite( state, siteId );
	const staleWithoutError = isStale( state, siteId ) && ! isError( state, siteId );
	const needsFollowsSync = needsFollowsStateSync( state, siteId );
	return isNotQueued && ( isMissing || staleWithoutError || needsFollowsSync );
}

function isStale( state, siteId ) {
	const lastFetched = state.reader.sites.lastFetched[ siteId ];
	if ( ! lastFetched ) {
		return true;
	}
	return lastFetched <= Date.now() - DAY_IN_MILLIS;
}

function isError( state, siteId ) {
	const site = getSite( state, siteId );
	return site && site.is_error;
}

/**
 * Checks if a site needs to be synced with the follows state
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId The site ID
 * @returns {boolean}        Whether the site needs follows sync
 */
function needsFollowsStateSync( state, siteId ) {
	const site = getSite( state, siteId );
	if ( ! site || ! site.feed_URL || ! site.is_following ) {
		return false;
	}

	// Check if the site exists in follows state
	const followsState = state.reader.follows.items;
	const urlKey = prepareComparableUrl( site.feed_URL );
	const existingFollow = followsState[ urlKey ];

	// If no follow exists for this site's feed URL, we need to sync
	return ! existingFollow;
}

/**
 * Returns a site object
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId The site ID
 * @returns {Object}        Site
 */

export function getSite( state, siteId ) {
	return state.reader.sites.items[ siteId ];
}

export function getSiteByFeedUrl( state, feedUrl ) {
	return find( state.reader.sites.items, { feed_URL: feedUrl } );
}
