import { useSelector } from 'react-redux';
import { useJetpackBlazeVersionCheck } from 'calypso/lib/promote-post';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useAdvertisingUrl = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	// Versions that move the dashboard from tools.php to admin.php: Jetpack
	// (Automattic/jetpack#49584) and the Blaze Ads plugin (Automattic/blaze-ads#93).
	// Keep these at or above the actual release versions: a too-low gate links to
	// admin.php on sites that still serve tools.php (no back-redirect), breaking it.
	const hasNewAdminPage = useJetpackBlazeVersionCheck( siteId, '16.1', '0.10.0' );
	const adminPage = hasNewAdminPage ? 'admin.php?page=advertising' : 'tools.php?page=advertising';
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId, adminPage ) );

	return siteAdminUrl;
};

export default useAdvertisingUrl;
