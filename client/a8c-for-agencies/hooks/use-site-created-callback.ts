import page from '@automattic/calypso-router';
import { useCallback } from 'react';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useTrackProvisioningSites from './use-track-provisioning-sites';

/**
 * @param refetchRandomSiteName Refreshes the suggested name for the next site.
 * @param onCreated Runs instead of the redirect to Sites, for a page that shows the new site itself.
 */
const useSiteCreatedCallback = (
	refetchRandomSiteName: () => Promise< void >,
	onCreated?: ( id: number ) => void
) => {
	const { refetch: refetchPendingSites } = useFetchPendingSites();

	const { trackSiteId } = useTrackProvisioningSites();

	return useCallback(
		( id: number, isDevSite?: boolean ) => {
			refetchPendingSites();
			refetchRandomSiteName();
			trackSiteId( id, { development: !! isDevSite } );
			if ( onCreated ) {
				onCreated( id );
				return;
			}
			page( A4A_SITES_LINK );
		},
		[ refetchPendingSites, refetchRandomSiteName, trackSiteId, onCreated ]
	);
};

export default useSiteCreatedCallback;
