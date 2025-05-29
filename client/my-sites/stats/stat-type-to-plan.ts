import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { paidStats } from './hooks/use-should-gate-stats';

export function statTypeToPlan( statType: string ) {
	// Commercial stats features that require the premium plan
	if ( paidStats.includes( statType ) ) {
		return PLAN_PREMIUM;
	}

	return PLAN_PERSONAL;
}
