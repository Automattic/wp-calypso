import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { premiumAnalyticsStatusRequest } from './use-premium-analytics-status-query';

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
	return useMutation< PremiumAnalyticsStatus, unknown, boolean >( {
		mutationFn: ( enabled: boolean ) =>
			wpcom.req.post( premiumAnalyticsStatusRequest( siteId ), { enabled } ),
		retry: 1,
		retryDelay: 3 * 1000,
		// Deliberately no write back into the status query. Whoever asked for that status is very
		// likely gating an invitation on it, and telling them mid-flow that the site is now
		// enabled pulls the invitation off the screen before it can report what it just did.
		// The next page load reads the real value, which is soon enough.
	} );
}
