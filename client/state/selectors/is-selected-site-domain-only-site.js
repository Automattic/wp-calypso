/**
 * Internal dependencies
 */
import { isDomainOnlySite, getSelectedSiteId } from 'state/selectors';

/**
 * Returns true if selected site is a Domain-only site, false if the site is a regular site,
 * or null if there is no selected or site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Boolean}        Whether selected site is a Domain-only site
 */
export default function isSelectedSiteDomainOnlySite( state ) {
	const selectedSiteId = getSelectedSiteId( state );

	if ( ! selectedSiteId ) {
		return null;
	}

	return isDomainOnlySite( state, selectedSiteId );
}
