import { shouldShowRefundEligibilityNotice } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Returns true if the refund eligibility notice should be shown for the given purchase.
 *
 * The calypso_split_cancel_refund_20260316 experiment concluded with treatment winning.
 * The experiment gate has been removed — treatment is now the default for all users.
 */
export function useShowRefundEligibilityNotice( purchase: Purchase ): boolean {
	return shouldShowRefundEligibilityNotice( purchase, true );
}
