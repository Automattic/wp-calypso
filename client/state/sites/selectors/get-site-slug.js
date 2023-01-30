import { createSelector } from '@automattic/state-utils';
import { withoutHttp, urlToSlug } from 'calypso/lib/url';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import getSiteOption from './get-site-option';
import getSiteOptions from './get-site-options';
import isSiteConflicting from './is-site-conflicting';

/**
 * Returns the slug for a site, or null if the site is unknown.
 *
 * @param  {Object}  state  Global state tree
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
	( state, siteId ) => [ getSitesItems( state ), getSiteOptions( state, siteId ) ]
);
