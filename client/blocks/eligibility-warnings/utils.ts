import { isEnabled } from '@automattic/calypso-config';
import type { EligibilityContext } from './index';
import type { EligibilityHold } from 'calypso/state/automated-transfer/constants';

export function isAtomicSiteWithoutBusinessPlan( holds: EligibilityHold[] ): boolean {
	return holds.includes( 'TRANSFER_ALREADY_EXISTS' ) && holds.includes( 'NO_BUSINESS_PLAN' );
}

/**
 * Whether the `NO_BUSINESS_PLAN` hold should upsell the Personal plan instead of Business,
 * because Personal is the lowest plan that unlocks what the context needs.
 */
export function shouldUpsellPersonalPlan(
	context: EligibilityContext | null,
	isMarketplace = false
): boolean {
	if ( context === 'plugins-upload' ) {
		return true;
	}
	// Partner themes are available from the Personal plan.
	if ( context === 'themes' && isMarketplace ) {
		return true;
	}
	return (
		( context === 'hosting' || context === 'hosting-features' ) &&
		isEnabled( 'hosting/dev-tools-all-paid-plans' )
	);
}
