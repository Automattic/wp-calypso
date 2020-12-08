/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import { withoutHttp, urlToSlug } from 'calypso/lib/url';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteOption from './get-site-option';
import isSiteConflicting from './is-site-conflicting';

/**
 * Returns the slug for a site, or null if the site is unknown.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?string}        Site slug
 */
export default createSelector(
	( state, siteId ) => {
		const site = getRawSite( state, siteId );
		if ( ! site ) {
			return null;
		}

		if ( getSiteOption( state, siteId, 'is_redirect' ) || isSiteConflicting( state, siteId ) ) {
			return withoutHttp( getSiteOption( state, siteId, 'unmapped_url' ) );
		}

		return urlToSlug( site.URL );
	},
	[ getSitesItems ]
);
