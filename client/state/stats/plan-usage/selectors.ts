import { get } from 'lodash';
import { PlanUsage } from 'calypso/my-sites/stats/hooks/use-plan-usage-query';

import 'calypso/state/stats/init';

export function getShouldShowPaywallNotice( state: object, siteId: number | null ): boolean {
	if ( ! siteId ) {
		return false;
	}

	const data = get( state, [ 'stats', 'planUsage', 'data', siteId ], null ) as PlanUsage;

	// Sites with a `paywall_date_from` have a paywall sticker,
	// and the date is when the sticker is added, not when the paywall is in effect.
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
