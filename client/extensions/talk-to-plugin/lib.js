/**
 * Internal dependencies
 */
import wp from 'lib/wp';

/*
 * Retrieve all options from the /options endpoint offered
 * by a third party plugin
 *
 * @param {int} [siteId]
 * @param {Function} fn
 * @api public
 */
export function fetchSiteOptions( siteId, fn ) {
	return wp.req.get( { path: '/jetpack-blogs/' + siteId + '/rest-api/' }, { path: '/wp/v2/options' }, fn );
}
