import type { ContactDetailsType } from '@automattic/wpcom-checkout';

/**
 * Whether a step transition completes the contact step. Auto-completed
 * checkouts can batch the contact and payment steps into one transition from
 * step 1 to no active step (0).
 */
export function isFirstContactStepComplete( {
	stepNumber,
	previousStepNumber,
	contactDetailsType,
}: {
	stepNumber: number | null;
	previousStepNumber: number;
	contactDetailsType: ContactDetailsType;
} ): boolean {
	if ( previousStepNumber !== 1 ) {
		return false;
	}
	if ( stepNumber === 2 ) {
		return true;
	}
	return stepNumber === 0 && contactDetailsType !== 'none';
}
