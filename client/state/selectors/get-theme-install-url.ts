import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl, getSiteSlug, isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function getThemeInstallUrl( state: AppState, siteId?: number | null ) {
	const canInstallTheme = siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES );
	const isWPCOMAtomicSite = isAtomicSite( state, siteId );

	if ( ! isAdminInterfaceWPAdmin( state, siteId ) || ! canInstallTheme || ! isWPCOMAtomicSite ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/themes/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'theme-install.php' );
}
