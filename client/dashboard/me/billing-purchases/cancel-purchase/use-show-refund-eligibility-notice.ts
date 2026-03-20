import { useExperiment } from 'calypso/lib/explat';
import { shouldShowRefundEligibilityNotice } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

const EXPERIMENT_NAME = 'calypso_split_cancel_refund_20260316';

/**
 * Returns true if the refund eligibility notice should be shown for the given purchase.
 *
 * The notice is shown when the user is assigned to the treatment variation of the
 * calypso_split_cancel_refund experiment and the purchase is a refundable WordPress.com plan.
 */
export function useShowRefundEligibilityNotice( purchase: Purchase ): boolean {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( EXPERIMENT_NAME );
	const isInTreatment =
		! isLoadingExperiment && experimentAssignment?.variationName === 'treatment';
	return shouldShowRefundEligibilityNotice( purchase, isInTreatment );
}
