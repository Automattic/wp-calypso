import page from '@automattic/calypso-router';
import { useCallback } from 'react';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useTrackProvisioningSites from './use-track-provisioning-sites';

const useSiteCreatedCallback = ( refetchRandomSiteName: () => Promise< void > ) => {
	const { refetch: refetchPendingSites } = useFetchPendingSites();

	const { trackSiteId } = useTrackProvisioningSites();

	return useCallback(
		( id: number, isDevSite?: boolean ) => {
			refetchPendingSites();
			refetchRandomSiteName();
			trackSiteId( id, { development: !! isDevSite } );
			page( A4A_SITES_LINK );
		},
		[ refetchPendingSites, refetchRandomSiteName, trackSiteId ]
	);
};

export default useSiteCreatedCallback;
