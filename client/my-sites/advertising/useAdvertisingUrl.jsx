import { useSelector } from 'react-redux';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useAdvertisingUrl = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=advertising' )
	);

	return siteAdminUrl;
};

export default useAdvertisingUrl;
