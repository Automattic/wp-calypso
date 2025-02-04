import { useSelector } from 'react-redux';
import { getSiteAdminUrl, isAdminInterfaceWPAdmin } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const useAdvertisingUrl = () => {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'tools.php?page=advertising' )
	);
	const adminInterfaceIsWPAdmin = useSelector( ( state ) =>
		isAdminInterfaceWPAdmin( state, siteId )
	);

	return adminInterfaceIsWPAdmin ? siteAdminUrl : `/advertising/${ selectedSiteSlug }`;
};

export default useAdvertisingUrl;
