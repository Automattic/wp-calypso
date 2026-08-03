import { COMMERCIAL_PAYWALL_KILLED } from 'calypso/my-sites/stats/constants';
import { PlanUsage } from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import type { AppState } from 'calypso/types';

import 'calypso/state/stats/init';

/*
 * Both selectors below read fields derived from the site's `jetpack-site-has-commercial-paywall`
 * sticker, which the client ignores while COMMERCIAL_PAYWALL_KILLED is true (STATS-387).
 *
 * `selectPlanUsage` already neutralises them as the payload arrives from the network, but this
 * slice is persisted (`withStorageKey( 'stats' )` + `withPersistence`, with an identity
 * deserialize), so a store written before the switch rehydrates with the old values intact and
 * bypasses that entirely. Holding the line on the read side covers rehydrated state and any
 * future dispatcher.
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

	return data?.should_show_paywall;
}
