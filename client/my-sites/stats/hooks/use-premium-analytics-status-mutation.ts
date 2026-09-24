import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	PREMIUM_ANALYTICS_ENABLED_SETTING,
	premiumAnalyticsStatusRequest,
} from './use-premium-analytics-status-query';

type SiteSettings = {
	[ PREMIUM_ANALYTICS_ENABLED_SETTING ]?: boolean;
};

/**
 * Switch the new analytics dashboard on or off for a site.
 *
 * Writes the opt-in through core's settings route, and reports what the site ended up with rather
 * than what was asked for — reads there answer with the effective state, which a filter can still
 * hold at off.
 *
 * The write can't take effect in its own request — the site resolves the flag once, early in the
 * page load — so a caller that wants the dashboard has to send the user to a fresh page load
 * afterwards rather than re-rendering in place.
 * @param siteId Site to update.
 */
export default function usePremiumAnalyticsStatusMutation( siteId: number | null ) {
	return useMutation< boolean | undefined, unknown, boolean >( {
		mutationFn: ( enabled: boolean ) =>
			wpcom.req
				.post( premiumAnalyticsStatusRequest( siteId ), {
					[ PREMIUM_ANALYTICS_ENABLED_SETTING ]: enabled,
				} )
				.then( ( data: SiteSettings ) => data?.[ PREMIUM_ANALYTICS_ENABLED_SETTING ] ),
		retry: 1,
		retryDelay: 3 * 1000,
		// Deliberately no write back into the status query. Whoever asked for that status is very
		// likely gating an invitation on it, and telling them mid-flow that the site is now
		// enabled pulls the invitation off the screen before it can report what it just did.
		// The next page load reads the real value, which is soon enough.
	} );
}
