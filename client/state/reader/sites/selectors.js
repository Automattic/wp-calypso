const DAY_IN_MILLIS = 24 * 60 * 1000 * 1000;

/**
* Returns true if we should fetch the site
*
* @param  {Object}  state  Global state tree
* @param  {Number}  siteId The site ID
* @return {Boolean}        Whether site should be fetched
*/

export function shouldSiteBeFetched( state, siteId ) {
	return ! state.reader.sites.queuedRequests[ siteId ] && // not currently queued
		(
			! getSite( state, siteId ) ||
			! lastUpdatedWithin( state, siteId, DAY_IN_MILLIS )
		);
}

function lastUpdatedWithin( state, siteId, timeInMillis ) {
	const lastUpdated = state.reader.sites.lastUpdated[ siteId ];
	if ( ! lastUpdated ) {
		return false;
	}
	return lastUpdated > ( Date.now() - timeInMillis );
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
