import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import type { AtomicTransfer, Purchase } from '@automattic/api-core';

export const NOW = '2026-02-24T12:00:00Z';
export const SITE_ID = 99;
export const OWNER_ID = 7;

export function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

export function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
		user_id: OWNER_ID,
		product_slug: DotcomPlans.BUSINESS,
		product_name: 'WordPress.com Business',
		site_slug: 'example.wordpress.com',
		expiry_date: expiryInDays( 120 ),
		expiry_status: 'manual-renew',
		subscription_status: 'active',
		is_plan: true,
		is_jetpack_plan_or_product: false,
		bill_period_days: SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
		is_auto_renew_enabled: false,
		is_rechargeable: true,
		might_still_auto_renew: false,
		is_past_first_auto_renew_attempt_date: false,
		is_past_last_auto_renew_attempt_date: false,
		...overrides,
	} as Purchase;
}

export const monthly = ( overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		product_slug: DotcomPlans.BUSINESS_MONTHLY,
		bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
		...overrides,
	} );

export const renewing = ( overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		expiry_status: 'active',
		is_auto_renew_enabled: true,
		might_still_auto_renew: true,
		...overrides,
	} );

/** Past the expiry date with the subscription still active: the grace period. */
export const grace = ( overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		expiry_date: expiryInDays( -1 ),
		expiry_status: 'expired',
		subscription_status: 'active',
		...overrides,
	} );

/** A transfer reverted for an expired plan `daysAgo` days before NOW. */
export function revertedTransfer(
	daysAgo: number,
	overrides: Partial< AtomicTransfer > = {}
): AtomicTransfer {
	const revertedAt = new Date( Date.UTC( 2026, 1, 24 - daysAgo, 12 ) );
	return {
		atomic_transfer_id: 555,
		blog_id: SITE_ID,
		status: 'reverted',
		created_at: '2025-06-01 09:00:00',
		reverted_at: revertedAt.toISOString().slice( 0, 19 ).replace( 'T', ' ' ),
		reverted_for_expired_plan: true,
		is_stuck: false,
		is_stuck_reset: false,
		in_lossless_revert: false,
		...overrides,
	};
}
