import config from '@automattic/calypso-config';
import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { paidStats } from './hooks/use-should-gate-stats';

export function statTypeToPlan( statType: string ) {
	if ( ! config.isEnabled( 'stats/paid-wpcom-v3' ) ) {
		return PLAN_PREMIUM;
	}

	// Commercial stats features that require the premium plan
	if ( paidStats.includes( statType ) ) {
		return PLAN_PREMIUM;
	}

	return PLAN_PERSONAL;
}
