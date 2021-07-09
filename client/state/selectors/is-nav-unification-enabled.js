/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteOption, isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import versionCompare from 'calypso/lib/version-compare';

export default ( state ) => {
	const hasDocument = 'undefined' !== typeof document;

	// Disable if explicitly requested by the `?disable-nav-unification` query param.
	if ( hasDocument && new URL( document.location ).searchParams.has( 'disable-nav-unification' ) ) {
		return false;
	}

	// Disabled for Jetpack sites below 9.8.
	const siteId = getSelectedSiteId( state );
	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		const jetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
		return jetpackVersion && versionCompare( jetpackVersion, '9.8-alpha', '>=' );
	}

	return true;
};
