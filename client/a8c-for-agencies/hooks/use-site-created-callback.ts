import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { useCallback, useContext } from 'react';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import SitesDashboardContext from '../sections/sites/sites-dashboard-context';

const useSiteCreatedCallback = ( refetchRandomSiteName: () => Promise< void > ) => {
	const { setRecentlyCreatedSiteId } = useContext( SitesDashboardContext );
	const { refetch: refetchPendingSites } = useFetchPendingSites();

	return useCallback(
		( id: number, isDevSite?: boolean ) => {
			refetchPendingSites();
			refetchRandomSiteName();
			setRecentlyCreatedSiteId( id );

			const queryParams = isDevSite ? { created_dev_site: id } : { created_site: id };
			page( addQueryArgs( A4A_SITES_LINK, queryParams ) );
		},
		[ refetchPendingSites, refetchRandomSiteName, setRecentlyCreatedSiteId ]
	);
};

export default useSiteCreatedCallback;
