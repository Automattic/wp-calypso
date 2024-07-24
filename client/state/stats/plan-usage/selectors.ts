import { get } from 'lodash';
import { PlanUsage } from 'calypso/my-sites/stats/hooks/use-plan-usage-query';

import 'calypso/state/stats/init';

export function getShouldShowPaywallNotice( state: object, siteId: number | null ): boolean {
	if ( ! siteId ) {
		return false;
	}

	const data = get( state, [ 'stats', 'planUsage', 'data', siteId ], null ) as PlanUsage;

	// Sites with a paywall_date_from means they have a paywall mark regardless of the grace period.
	return !! data?.paywall_date_from;
}

export function getShouldShowPaywallAfterGracePeriod(
	state: object,
	siteId: number | null
): boolean {
	if ( ! siteId ) {
		return false;
	}

	const data = get( state, [ 'stats', 'planUsage', 'data', siteId ], null ) as PlanUsage;

	return data?.should_show_paywall;
}
