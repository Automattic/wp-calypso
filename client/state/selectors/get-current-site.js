import { getSiteFragment } from 'calypso/lib/route';
import { getSite } from '../sites/selectors';
import getCurrentRoute from './get-current-route';

/**
 * Retrieves the site the user is currently viewing.
 * @param {Object} state	Global Redux state
 * @returns {import('@automattic/data-stores').SiteDetails|null|undefined}	The current site
 */
export const getCurrentSite = ( state ) => {
	const currentPath = getCurrentRoute( state );

	if ( ! currentPath ) {
		return null;
	}

	const siteFragment = getSiteFragment( currentPath );

	if ( ! siteFragment ) {
		return null;
	}

	return getSite( state, siteFragment );
};

export default getCurrentSite;
