/**
 * Internal dependencies
 */
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import getSelectedSiteId from './get-selected-site-id';

/**
 * Returns the slug of the currently selected site,
 * or null if no site is selected.
 *
 * @param  {object}  state Global state tree
 * @returns {?string}       Selected site slug
 */
export default function getSelectedSiteSlug( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSiteSlug( state, siteId );
}
