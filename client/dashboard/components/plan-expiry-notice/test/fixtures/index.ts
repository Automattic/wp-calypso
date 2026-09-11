import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import type { Purchase } from '@automattic/api-core';

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

/** Past the expiry date with the subscription removed: the post-grace window. */
export const removed = ( daysAgo: number, overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		expiry_date: expiryInDays( -daysAgo ),
		expiry_status: 'expired',
		subscription_status: 'inactive',
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

export const postGrace = () => removed( 40 );
