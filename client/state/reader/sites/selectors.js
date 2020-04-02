/**
 * External Dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/reader/init';

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

/**
 * Get a list of blog ids that are currently viewed
 *
 * @param state redux state
 * @returns {[]} list of blog ids that are currently viewed
 */
export function getViewingBlogIds( state ) {
	const viewingBlogs = state.reader.sites.viewing;
	const blogIds = [];

	if ( viewingBlogs.list ) {
		for ( const blogId in viewingBlogs.list ) {
			if ( viewingBlogs.list[ blogId ].length > 0 ) {
				blogIds.push( parseInt( blogId ) );
			}
		}
	}

	if ( viewingBlogs.detail ) {
		blogIds.push( parseInt( viewingBlogs.detail ) );
	}

	return blogIds;
}

export function getSiteByFeedUrl( state, feedUrl ) {
	return find( state.reader.sites.items, { feed_URL: feedUrl } );
}
