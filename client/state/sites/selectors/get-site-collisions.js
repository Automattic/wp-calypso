/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';
import { withoutHttp } from 'calypso/lib/url';
import getSitesItems from 'calypso/state/selectors/get-sites-items';

/**
 * Returns a filtered array of WordPress.com site IDs where a Jetpack site
 * exists in the set of sites with the same URL.
 *
 * @param  {object}   state Global state tree
 * @returns {number[]}       WordPress.com site IDs with collisions
 */
export default createSelector( ( state ) => {
	const sitesItems = Object.values( getSitesItems( state ) );
	return sitesItems
		.filter( ( site ) => {
			const siteUrlSansProtocol = withoutHttp( site.URL );
			return (
				! site.jetpack &&
				sitesItems.some(
					( jetpackSite ) =>
						jetpackSite.jetpack && siteUrlSansProtocol === withoutHttp( jetpackSite.URL )
				)
			);
		} )
		.map( ( site ) => site.ID );
}, getSitesItems );
