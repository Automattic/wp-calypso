import { filter, map, some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { withoutHttp } from 'lib/url';
import getSitesItems from 'state/selectors/get-sites-items';

/**
 * Returns a filtered array of WordPress.com site IDs where a Jetpack site
 * exists in the set of sites with the same URL.
 *
 * @param  {object}   state Global state tree
 * @returns {number[]}       WordPress.com site IDs with collisions
 */
export default createSelector(
	( state ) =>
		map(
			filter( getSitesItems( state ), ( wpcomSite ) => {
				const wpcomSiteUrlSansProtocol = withoutHttp( wpcomSite.URL );
				return (
					! wpcomSite.jetpack &&
					some(
						getSitesItems( state ),
						( jetpackSite ) =>
							jetpackSite.jetpack && wpcomSiteUrlSansProtocol === withoutHttp( jetpackSite.URL )
					)
				);
			} ),
			'ID'
		),
	getSitesItems
);
