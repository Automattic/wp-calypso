import { PlanUsage } from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { COMMERCIAL_PAYWALL_KILLED } from './constants';
import type { AppState } from 'calypso/types';

import 'calypso/state/stats/init';

/*
 * Both selectors below read fields derived from the site's `jetpack-site-has-commercial-paywall`
 * sticker, which the client ignores while COMMERCIAL_PAYWALL_KILLED is true (STATS-387).
 *
 * The switch is applied on read rather than on the way in, so the stored payload stays faithful to
 * what the API actually said. That matters because this slice is persisted (`withStorageKey(
 * 'stats' )` over `withPersistence`, with an identity deserialize): neutralising the data before
 * dispatch would bake the switch into every user's storage, and flipping it back would then be
 * honoured only after a refetch. Guarding here also covers state rehydrated from before the switch
 * shipped, which never passes through the query at all.
 */

export function getShouldShowPaywallNotice( state: object, siteId: number | null ): boolean {
	if ( ! siteId || COMMERCIAL_PAYWALL_KILLED ) {
		return false;
	}

	const data = ( ( state as AppState )?.stats?.planUsage?.data?.[ siteId ] ?? null ) as PlanUsage;

	// Sites with a `paywall_date_from` have a paywall sticker,
	// and the date is when the sticker is added, not when the paywall is in effect.
	return !! data?.paywall_date_from;
}

export function getShouldShowPaywallAfterGracePeriod(
	state: object,
	siteId: number | null
): boolean {
	if ( ! siteId || COMMERCIAL_PAYWALL_KILLED ) {
		return false;
	}

	const data = ( ( state as AppState )?.stats?.planUsage?.data?.[ siteId ] ?? null ) as PlanUsage;

	return !! data?.should_show_paywall;
}
