import { useSelector } from 'react-redux';
import { useJetpackBlazeVersionCheck } from 'calypso/lib/promote-post';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useAdvertisingUrl = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const hasNewAdminPage = useJetpackBlazeVersionCheck( siteId, '15.8-alpha', '0.9.0' );
	const adminPage = hasNewAdminPage ? 'admin.php?page=advertising' : 'tools.php?page=advertising';
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId, adminPage ) );

	return siteAdminUrl;
};

export default useAdvertisingUrl;
