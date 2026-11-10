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
export function shouldUpsellPersonalPlan( context: EligibilityContext | null ): boolean {
	if ( context === 'plugins-upload' ) {
		return true;
	}
	return (
		( context === 'hosting' || context === 'hosting-features' ) &&
		isEnabled( 'hosting/dev-tools-all-paid-plans' )
	);
}

/**
 * Whether the `NO_BUSINESS_PLAN` hold should ask for any paid plan, because every paid plan
 * unlocks what the context needs and its CTA lets the user pick one.
 */
export function shouldUpsellAnyPaidPlan( context: EligibilityContext | null ): boolean {
	return context === 'plugin-details' && isEnabled( 'hosting/dev-tools-all-paid-plans' );
}
