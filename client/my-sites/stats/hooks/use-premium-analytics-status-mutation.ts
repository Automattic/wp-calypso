import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

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

	return useMutation( {
		mutationFn: ( enabled: boolean ) =>
			wpcom.req.post( {
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/premium-analytics/status`,
				body: { enabled },
			} ),
		onSuccess: ( _data, enabled ) => {
			queryClient.setQueryData( [ 'stats', 'premium-analytics-status', siteId ], { enabled } );
		},
	} );
}
