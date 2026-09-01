import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	premiumAnalyticsStatusQueryKey,
	premiumAnalyticsStatusRequest,
} from './use-premium-analytics-status-query';

type PremiumAnalyticsStatus = {
	enabled: boolean;
};

/**
 * Switch the new analytics dashboard on or off for a site.
 *
 * The write can't take effect in its own request — the site resolves the flag once, early in the
 * page load — so a caller that wants the dashboard has to send the user to a fresh page load
 * afterwards rather than re-rendering in place.
 * @param siteId Site to update.
 */
export default function usePremiumAnalyticsStatusMutation( siteId: number | null ) {
	const queryClient = useQueryClient();

	return useMutation< PremiumAnalyticsStatus, unknown, boolean >( {
		mutationFn: ( enabled: boolean ) =>
			wpcom.req.post( premiumAnalyticsStatusRequest( siteId ), { enabled } ),
		retry: 1,
		retryDelay: 3 * 1000,
		// Cache what the site reported, not what we asked for: a 200 saying `false` means the write
		// didn't take, and treating it as success would send someone to a page that isn't there.
		onSuccess: ( data ) => {
			queryClient.setQueryData( premiumAnalyticsStatusQueryKey( siteId ), {
				enabled: !! data?.enabled,
			} );
		},
	} );
}
