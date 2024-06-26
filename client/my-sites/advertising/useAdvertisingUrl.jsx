import { useSelector } from 'react-redux';
import { getSiteAdminUrl, isGlobalSiteViewEnabled } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const useAdvertisingUrl = () => {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'tools.php?page=advertising' )
	);
	const globalSiteViewEnabled = useSelector( ( state ) =>
		isGlobalSiteViewEnabled( state, siteId )
	);

	return globalSiteViewEnabled ? siteAdminUrl : `/advertising/${ selectedSiteSlug }`;
};

export default useAdvertisingUrl;
