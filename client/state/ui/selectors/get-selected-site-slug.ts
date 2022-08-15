import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { IAppState } from 'calypso/state/types';
import getSelectedSiteId from './get-selected-site-id';

/**
 * Returns the slug of the currently selected site,
 * or null if no site is selected.
 *
 * @param  {object}  state Global state tree
 * @returns {?string}       Selected site slug
 */
export default function getSelectedSiteSlug( state: IAppState ): null | string {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSiteSlug( state, siteId );
}
