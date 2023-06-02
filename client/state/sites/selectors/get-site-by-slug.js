import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import getSiteSlug from './get-site-slug';

/**
 * Returns a site object by its slug.
 *
 * @param  {Object}  state     Global state tree
 * @param  {string}  siteSlug  Site URL
 * @returns {?Object}           Site object
 */
export default createSelector(
	( state, siteSlug ) => {
		const sites = Object.values( getSitesItems( state ) );
		return sites.find( ( site ) => getSiteSlug( state, site.ID ) === siteSlug ) ?? null;
	},
	( state ) => [ getSitesItems( state ) ]
);
