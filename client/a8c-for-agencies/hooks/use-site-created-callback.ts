import page from '@automattic/calypso-router';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import { useCallback, useContext, useEffect } from 'react';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import SitesDashboardContext from '../sections/sites/sites-dashboard-context';

const useSiteCreatedCallback = ( refetchRandomSiteName: () => Promise< void > ) => {
	const createdSiteId = getQueryArg( window.location.href, 'created_site' ) ?? null;
	const createdDevSiteId = getQueryArg( window.location.href, 'created_dev_site' ) ?? null;

	const recentlyCreatedSite = createdSiteId || createdDevSiteId;
	const { setRecentlyCreatedSiteId, setIsRecentlyCreatedSiteDevelopment } =
		useContext( SitesDashboardContext );
	const { refetch: refetchPendingSites } = useFetchPendingSites();

	useEffect( () => {
		if ( recentlyCreatedSite ) {
			setRecentlyCreatedSiteId( Number( recentlyCreatedSite ) );
		}
		if ( createdDevSiteId ) {
			setIsRecentlyCreatedSiteDevelopment( true );
		}
	}, [
		createdDevSiteId,
		recentlyCreatedSite,
		setIsRecentlyCreatedSiteDevelopment,
		setRecentlyCreatedSiteId,
	] );

	return useCallback(
		( id: number, isDevSite?: boolean ) => {
			refetchPendingSites();
			refetchRandomSiteName();
			setRecentlyCreatedSiteId( id );
			setIsRecentlyCreatedSiteDevelopment( !! isDevSite );

			const queryParams = isDevSite ? { created_dev_site: id } : { created_site: id };
			page( addQueryArgs( A4A_SITES_LINK, queryParams ) );
		},
		[
			refetchPendingSites,
			refetchRandomSiteName,
			setRecentlyCreatedSiteId,
			setIsRecentlyCreatedSiteDevelopment,
		]
	);
};

export default useSiteCreatedCallback;
