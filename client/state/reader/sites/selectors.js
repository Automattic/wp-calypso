/**
* Returns true if we should fetch the feed
*
* @param  {Object}  state  Global state tree
* @param  {Number}  siteId The site ID
* @return {Boolean}        Whether site should be fetched
*/

export function shouldSiteBeFetched( state, siteId ) {
	return ! state.reader.sites.queuedRequests[ siteId ] && // not currently queued
		! state.reader.sites.items[ siteId ]; // not currently loaded
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
