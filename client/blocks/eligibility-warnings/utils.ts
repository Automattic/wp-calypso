import type { EligibilityHold } from 'calypso/state/automated-transfer/constants';

export function isAtomicSiteWithoutBusinessPlan( holds: EligibilityHold[] ): boolean {
	return holds.includes( 'TRANSFER_ALREADY_EXISTS' ) && holds.includes( 'NO_BUSINESS_PLAN' );
}
