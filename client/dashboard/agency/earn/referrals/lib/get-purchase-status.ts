import { __ } from '@wordpress/i18n';
import type { ReferralPurchase } from '@automattic/api-core';
import type { Badge } from '@wordpress/ui';
import type { ComponentProps } from 'react';

export type PurchaseStatusBadgeIntent = NonNullable< ComponentProps< typeof Badge >[ 'intent' ] >;

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
			? { status: __( 'Assigned' ), type: 'stable' }
			: { status: __( 'Unassigned' ), type: 'medium' };
	}
	if ( purchase.status === 'canceled' ) {
		return { status: __( 'Canceled' ), type: 'informational' };
	}
	if ( purchase.status === 'error' ) {
		return { status: __( 'Error' ), type: 'high' };
	}
	return { status: __( 'Awaiting payment' ), type: 'medium' };
}
