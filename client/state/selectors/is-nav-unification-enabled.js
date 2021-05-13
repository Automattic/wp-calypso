/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

export default ( state ) => {
	const hasDocument = 'undefined' !== typeof document;

	// Disable if explicitly requested by the `?disable-nav-unification` query param.
	if ( hasDocument && new URL( document.location ).searchParams.has( 'disable-nav-unification' ) ) {
		return false;
	}

	// Disabled for Jetpack sites.
	const siteId = getSelectedSiteId( state );
	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		return false;
	}

	return true;
};
