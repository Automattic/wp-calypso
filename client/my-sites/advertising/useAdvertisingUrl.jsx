import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { getSiteAdminUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const useAdvertisingUrl = () => {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const adminInterface = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'wpcom_admin_interface' )
	);

	return adminInterface === 'wp-admin' && isEnabled( 'layout/dotcom-nav-redesign' )
		? `${ siteAdminUrl }tools.php?page=advertising`
		: `/advertising/${ selectedSiteSlug }`;
};

export default useAdvertisingUrl;
