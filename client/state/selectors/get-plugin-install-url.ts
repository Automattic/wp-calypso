import { FEATURE_INSTALL_PLUGINS } from '@automattic/calypso-products';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl, getSiteSlug, isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function getPluginInstallUrl( state: AppState, siteId?: number | null ) {
	const hasInstallPlugins = siteHasFeature( state, siteId, FEATURE_INSTALL_PLUGINS );
	const isWPCOMAtomicSite = isAtomicSite( state, siteId );

	// If the site doesn't have the install plugins feature, isn't Atomic, or is not using the WP Admin interface,
	// avoid redirecting to the WP Admin plugins page.
	if ( ! isAdminInterfaceWPAdmin( state, siteId ) || ! hasInstallPlugins || ! isWPCOMAtomicSite ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/plugins/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'plugin-install.php' );
}
