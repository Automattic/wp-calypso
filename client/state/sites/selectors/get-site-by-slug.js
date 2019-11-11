/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSitesItems from 'state/selectors/get-sites-items';
import getSiteSlug from './get-site-slug';

/**
 * Returns a site object by its slug.
 *
 * @param  {Object}  state     Global state tree
 * @param  {String}  siteSlug  Site URL
 * @return {?Object}           Site object
 */
export default createSelector(
	( state, siteSlug ) =>
		find( getSitesItems( state ), site => getSiteSlug( state, site.ID ) === siteSlug ) || null,
	getSitesItems
);
