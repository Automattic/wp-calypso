import { __ } from '@wordpress/i18n';
import type { ReferralPurchase } from '@automattic/api-core';

export type PurchaseStatusBadgeIntent = 'default' | 'info' | 'success' | 'warning' | 'error';

/**
 * A purchase reports its own status rather than its referral order's, so an
 * unpaid one reads as "Awaiting payment" instead of the order's "Pending".
 */
export function getPurchaseStatus( purchase: ReferralPurchase ): {
	status: string;
	type: PurchaseStatusBadgeIntent;
} {
	if ( purchase.status === 'active' ) {
		return purchase.site_assigned
			? { status: __( 'Assigned' ), type: 'success' }
			: { status: __( 'Unassigned' ), type: 'warning' };
	}
	if ( purchase.status === 'canceled' ) {
		return { status: __( 'Canceled' ), type: 'info' };
	}
	if ( purchase.status === 'error' ) {
		return { status: __( 'Error' ), type: 'error' };
	}
	return { status: __( 'Awaiting payment' ), type: 'warning' };
}
