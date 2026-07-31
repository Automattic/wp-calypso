/**
 * @jest-environment jsdom
 */

import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import MockDate from 'mockdate';
import { getPlanExpiryNotice, isEligibleForPlanExpiryNotice } from '../get-plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

const NOW = '2026-02-24T12:00:00Z';

/**
 * Noon UTC keeps the calendar-day arithmetic stable regardless of the time
 * zone the test runner happens to be in.
 */
function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		product_slug: DotcomPlans.BUSINESS,
		product_name: 'WordPress.com Business',
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

/** A plan that is auto-renewing normally. */
function autoRenewing( overrides: Partial< Purchase > = {} ): Purchase {
	return makePurchase( {
		expiry_status: 'active',
		is_auto_renew_enabled: true,
		might_still_auto_renew: true,
		...overrides,
	} );
}

beforeEach( () => {
	MockDate.set( NOW );
} );

afterEach( () => {
	MockDate.reset();
} );

describe( 'isEligibleForPlanExpiryNotice', () => {
	test( 'accepts each WordPress.com plan family', () => {
		[
			DotcomPlans.PERSONAL,
			DotcomPlans.PREMIUM,
			DotcomPlans.BUSINESS_2_YEARS,
			DotcomPlans.ECOMMERCE_MONTHLY,
		].forEach( ( product_slug ) => {
			expect( isEligibleForPlanExpiryNotice( makePurchase( { product_slug } ) ) ).toBe( true );
		} );
	} );

	test( 'rejects anything that is not one of those plans', () => {
		[
			'jetpack_security_t1_yearly',
			'domain_reg',
			'free_plan',
			'ecommerce-trial-bundle-monthly',
		].forEach( ( product_slug ) => {
			expect( isEligibleForPlanExpiryNotice( makePurchase( { product_slug } ) ) ).toBe( false );
		} );
	} );

	test( 'rejects a purchase that carries a plan slug but is not a plan', () => {
		expect(
			isEligibleForPlanExpiryNotice(
				makePurchase( { is_plan: false, is_domain_registration: true } )
			)
		).toBe( false );
	} );

	test( 'rejects partner-managed plans, which the customer cannot renew', () => {
		expect( isEligibleForPlanExpiryNotice( makePurchase( { partner_type: 'agency' } ) ) ).toBe(
			false
		);
	} );

	test( 'rejects removed subscriptions, which keep their existing copy', () => {
		expect(
			isEligibleForPlanExpiryNotice(
				makePurchase( { expiry_status: 'expired', subscription_status: 'inactive' } )
			)
		).toBe( false );
	} );

	test( 'is true even when no notice is shown, so weaker notices stay suppressed', () => {
		const purchase = autoRenewing( { expiry_date: expiryInDays( 120 ) } );
		expect( isEligibleForPlanExpiryNotice( purchase ) ).toBe( true );
		expect( getPlanExpiryNotice( purchase ) ).toBeNull();
	} );
} );

describe( 'more than 60 days before expiration', () => {
	test( 'warns an annual plan that cannot auto-renew, at info urgency', () => {
		const notice = getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 120 ) } ) );

		expect( notice?.variant ).toBe( 'info' );
		expect( notice?.title ).toBe( 'Your Business plan expires in 4 months' );
		expect( notice?.body ).toContain( '50 GB of storage' );
		expect( notice?.body ).toContain( 'Turn on auto-renew' );
	} );

	test( 'names the expiration date in the body', () => {
		const notice = getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 120 ) } ), {
			locale: 'en',
		} );

		expect( notice?.body ).toContain( 'After June 24, 2026,' );
	} );

	test( 'offers to turn auto-renew on when it is simply switched off', () => {
		const notice = getPlanExpiryNotice(
			makePurchase( { expiry_date: expiryInDays( 120 ), is_auto_renew_enabled: false } )
		);

		expect( notice?.primaryAction ).toEqual( {
			type: 'enable-auto-renew',
			label: 'Turn on auto-renew',
		} );
	} );

	test( 'sends the reader to add a payment method when that is what is missing', () => {
		const notice = getPlanExpiryNotice(
			makePurchase( {
				expiry_date: expiryInDays( 120 ),
				is_auto_renew_enabled: true,
				is_rechargeable: false,
				might_still_auto_renew: false,
			} )
		);

		expect( notice?.primaryAction ).toEqual( {
			type: 'add-payment-method',
			label: 'Turn on auto-renew',
		} );
	} );

	test( 'says nothing about a plan that is auto-renewing normally', () => {
		expect(
			getPlanExpiryNotice( autoRenewing( { expiry_date: expiryInDays( 120 ) } ) )
		).toBeNull();
	} );
} );

describe( 'within 60 days of expiration', () => {
	test( 'escalates an annual plan that cannot auto-renew to a warning', () => {
		const notice = getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 45 ) } ) );

		expect( notice?.variant ).toBe( 'warning' );
		// Days, not "in 1 month" — a rounded month reads far less urgent.
		expect( notice?.title ).toBe( 'Your Business plan expires in 45 days' );
		expect( notice?.primaryAction ).toMatchObject( { type: 'link', label: 'Renew now' } );
	} );

	test( 'sends renewal checkout back where the caller says, not hardcoded to the dashboard', () => {
		const notice = getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 45 ) } ), {
			renewReturnUrl: '/me/purchases/example.com/1234',
		} );

		const href =
			notice?.primaryAction && 'href' in notice.primaryAction && notice.primaryAction.href;
		expect( href ).toContain( 'cancel_to=%2Fme%2Fpurchases%2Fexample.com%2F1234' );
		expect( href ).toContain( 'redirect_to=%2Fme%2Fpurchases%2Fexample.com%2F1234' );
	} );

	test( 'names the expiration date in the body', () => {
		const notice = getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 45 ) } ), {
			locale: 'en',
		} );

		expect( notice?.body ).toContain( 'After April 10, 2026,' );
	} );

	test( 'stays quiet about an auto-renewing plan whose first attempt is still ahead', () => {
		expect( getPlanExpiryNotice( autoRenewing( { expiry_date: expiryInDays( 45 ) } ) ) ).toBeNull();
	} );
} );

describe( 'past the first scheduled auto-renewal attempt', () => {
	test( 'counts down an auto-renewing plan that failed its first attempt', () => {
		const notice = getPlanExpiryNotice(
			autoRenewing( {
				expiry_date: expiryInDays( 29 ),
				is_past_first_auto_renew_attempt_date: true,
			} )
		);

		expect( notice?.variant ).toBe( 'warning' );
		expect( notice?.title ).toBe( 'Your Business plan has 29 days remaining' );
		expect( notice?.body ).toContain( 'If renewal doesn’t go through' );
	} );

	test( 'keeps the "cannot auto-renew" wording for a plan that never could', () => {
		const notice = getPlanExpiryNotice(
			makePurchase( {
				expiry_date: expiryInDays( 29 ),
				is_past_first_auto_renew_attempt_date: true,
			} )
		);

		expect( notice?.variant ).toBe( 'warning' );
		expect( notice?.title ).toBe( 'Your Business plan expires in 29 days' );
	} );
} );

describe( 'within 7 days of expiration', () => {
	test( 'escalates a plan that cannot auto-renew to an error, whatever its term', () => {
		[
			SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD,
			SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
		].forEach( ( bill_period_days ) => {
			const notice = getPlanExpiryNotice(
				makePurchase( { expiry_date: expiryInDays( 5 ), bill_period_days } )
			);

			expect( notice?.variant ).toBe( 'error' );
			expect( notice?.title ).toBe( 'Your Business plan expires in 5 days' );
		} );
	} );

	test( 'counts down an annual plan that can still auto-renew', () => {
		const notice = getPlanExpiryNotice( autoRenewing( { expiry_date: expiryInDays( 5 ) } ) );

		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has 5 days remaining' );
	} );

	test( 'says nothing about a monthly plan that is billing normally', () => {
		const notice = getPlanExpiryNotice(
			autoRenewing( {
				expiry_date: expiryInDays( 5 ),
				bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
			} )
		);

		expect( notice ).toBeNull();
	} );
} );

describe( 'on the day of expiration', () => {
	test( 'reads "expires today" whether or not the plan can auto-renew', () => {
		[ makePurchase(), autoRenewing() ].forEach( ( base ) => {
			const notice = getPlanExpiryNotice( { ...base, expiry_date: expiryInDays( 0 ) } );

			expect( notice?.variant ).toBe( 'error' );
			expect( notice?.title ).toBe( 'Your Business plan expires today' );
		} );
	} );

	test( 'distinguishes the two cases in the body copy', () => {
		expect(
			getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 0 ) } ) )?.body
		).toMatch( /^Unless you renew your plan/ );

		expect(
			getPlanExpiryNotice( autoRenewing( { expiry_date: expiryInDays( 0 ) } ) )?.body
		).toMatch( /^If renewal doesn’t go through/ );
	} );
} );

describe( 'after the expiration date', () => {
	const expired = ( overrides: Partial< Purchase > = {} ) =>
		makePurchase( {
			expiry_date: expiryInDays( -3 ),
			expiry_status: 'expired',
			subscription_status: 'active',
			...overrides,
		} );

	test( 'reports the plan as expired and offers a way out', () => {
		const notice = getPlanExpiryNotice( expired(), {
			viewOtherPlansUrl: '/setup/plan-upgrade',
		} );

		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
		expect( notice?.primaryAction ).toMatchObject( { label: 'Renew now' } );
		expect( notice?.secondaryAction ).toMatchObject( {
			label: 'View other plans',
			href: '/setup/plan-upgrade',
		} );
	} );

	test( 'leaves out the other-plans action when there is nowhere to send them', () => {
		expect( getPlanExpiryNotice( expired() )?.secondaryAction ).toBeUndefined();
	} );

	test( 'softens the copy while an auto-renewal attempt may still land', () => {
		const notice = getPlanExpiryNotice(
			expired( { is_auto_renew_enabled: true, might_still_auto_renew: true } )
		);

		expect( notice?.body ).toMatch( /^If renewal doesn’t go through/ );
	} );

	test( 'falls back to the definite wording once the attempts are exhausted', () => {
		// `might_still_auto_renew` is already false past the final attempt, so
		// this needs no branch of its own — but that must stay true.
		const notice = getPlanExpiryNotice(
			expired( {
				is_auto_renew_enabled: true,
				might_still_auto_renew: false,
				is_past_last_auto_renew_attempt_date: true,
			} )
		);

		expect( notice?.body ).toMatch( /^Your site will move to the Free plan\./ );
	} );
} );

describe( 'storage figures', () => {
	test.each( [
		[ DotcomPlans.PERSONAL, 'Personal', 6 ],
		[ DotcomPlans.PREMIUM, 'Premium', 13 ],
		[ DotcomPlans.BUSINESS, 'Business', 50 ],
		[ DotcomPlans.ECOMMERCE, 'Commerce', 50 ],
	] )( '%s reads as the %s plan with %d GB', ( product_slug, planName, storageGb ) => {
		const notice = getPlanExpiryNotice(
			makePurchase( { product_slug: product_slug as string, expiry_date: expiryInDays( 45 ) } )
		);

		expect( notice?.title ).toContain( planName );
		expect( notice?.body ).toContain( `${ storageGb } GB of storage` );
	} );
} );

describe( 'monthly plans that cannot auto-renew', () => {
	test( 'stay quiet until the last week', () => {
		const monthly = makePurchase( {
			bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
			expiry_date: expiryInDays( 20 ),
		} );

		expect( getPlanExpiryNotice( monthly ) ).toBeNull();
	} );
} );
