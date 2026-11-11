/**
 * @jest-environment jsdom
 */
import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import MockDate from 'mockdate';
import { wpcomLink } from '../../../utils/link';
import { getPlanExpiryStatus } from '../get-plan-expiry-status';
import type { Purchase, Site } from '@automattic/api-core';

const NOW = '2026-02-24T12:00:00Z';
const SITE_ID = 77;

/**
 * Noon UTC keeps the calendar-day arithmetic stable regardless of the time zone
 * the test runner happens to be in.
 */
function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makeSite( plan: Partial< NonNullable< Site[ 'plan' ] > > = {} ): Site {
	return {
		ID: SITE_ID,
		slug: 'test.wordpress.com',
		plan: {
			product_slug: DotcomPlans.BUSINESS,
			product_name_short: 'Business',
			expired: false,
			user_is_owner: true,
			...plan,
		},
	} as Site;
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
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

beforeEach( () => {
	MockDate.set( NOW );
} );

afterEach( () => {
	MockDate.reset();
} );

describe( 'getPlanExpiryStatus', () => {
	test( 'says nothing about a plan that is renewing normally', () => {
		const purchase = makePurchase( {
			expiry_date: expiryInDays( 30 ),
			expiry_status: 'active',
			is_auto_renew_enabled: true,
			might_still_auto_renew: true,
		} );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toBeNull();
	} );

	test( 'says nothing about a plan expiring further out than the warning window', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 61 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toBeNull();
	} );

	test( 'warns from the first day of the warning window', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 60 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toEqual(
			expect.objectContaining( { intent: 'warning', text: 'Expires in 60 days' } )
		);
	} );

	test( 'is still a warning on the last day before the error window', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 8 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toEqual(
			expect.objectContaining( { intent: 'warning', text: 'Expires in 8 days' } )
		);
	} );

	test( 'turns into an error on the first day of the error window', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 7 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toEqual(
			expect.objectContaining( { intent: 'error', text: 'Expires in 7 days' } )
		);
	} );

	test( 'counts the last day as expiring today', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 0 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toEqual(
			expect.objectContaining( { intent: 'error', text: 'Expires today' } )
		);
	} );

	test( 'links an approaching expiry to renewing that subscription', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 45 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' )?.href ).toContain(
			'/checkout/renew/1234'
		);
	} );

	test( 'reports the stage and day count the wp-admin banner reports', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 45 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toEqual(
			expect.objectContaining( { state: 'approaching_expiry', daysRemaining: 45, cta: 'renew' } )
		);
	} );

	test( 'names the expiry date the wording leaves out', () => {
		const purchase = makePurchase( { expiry_date: expiryInDays( 45 ) } );

		expect( getPlanExpiryStatus( makeSite(), purchase, 'en' )?.title ).toBe(
			'Expires on April 10, 2026 (renew this purchase)'
		);
	} );

	test( 'says a plan in its grace period has expired', () => {
		const site = makeSite( { expired: true } );
		const purchase = makePurchase( {
			expiry_date: expiryInDays( -3 ),
			expiry_status: 'expired',
		} );

		expect( getPlanExpiryStatus( site, purchase, 'en' ) ).toEqual( {
			intent: 'error',
			text: 'Plan expired',
			href: expect.stringContaining( '/checkout/renew/1234' ),
			cta: 'renew',
			title: 'Expired on February 21, 2026 (renew this purchase)',
			state: 'expired_grace',
			daysRemaining: -3,
		} );
	} );

	test( 'tells a non-subscriber that the plan has expired, without offering to renew it', () => {
		const site = makeSite( { expired: true, user_is_owner: false } );

		expect( getPlanExpiryStatus( site, undefined, 'en' ) ).toEqual( {
			intent: 'error',
			text: 'Plan expired',
			href: undefined,
			cta: undefined,
			title:
				'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.',
			state: 'expired_grace',
			daysRemaining: undefined,
		} );
	} );

	// wp-admin's `Expiry_Data::MONTHLY_NOTICE_DAYS`.
	describe( 'monthly terms, which reach the annual window almost as soon as they start', () => {
		test( 'stay quiet through the warning window', () => {
			const purchase = makePurchase( {
				bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
				expiry_date: expiryInDays( 25 ),
			} );

			expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toBeNull();
		} );

		test( 'speak up once inside the error window', () => {
			const purchase = makePurchase( {
				bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
				expiry_date: expiryInDays( 5 ),
			} );

			expect( getPlanExpiryStatus( makeSite(), purchase, 'en' ) ).toEqual(
				expect.objectContaining( { intent: 'error', text: 'Expires in 5 days' } )
			);
		} );
	} );

	test( 'offers the subscriber checkout for the current plan before the purchase loads', () => {
		const site = makeSite( { expired: true } );

		expect( getPlanExpiryStatus( site, undefined, 'en' )?.href ).toBe(
			wpcomLink( '/checkout/test.wordpress.com/business-bundle' )
		);
	} );

	test( 'sends an expired trial to buy a plan rather than renew one', () => {
		const site = makeSite( {
			product_slug: DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
			product_name_short: 'Trial',
			expired: true,
		} );

		expect( getPlanExpiryStatus( site, undefined, 'en' ) ).toEqual(
			expect.objectContaining( {
				href: expect.stringContaining( '/plans/test.wordpress.com' ),
				cta: 'upgrade',
			} )
		);
	} );

	test( 'says nothing about a plan somebody else pays for until it lapses', () => {
		// The viewer has no purchase for it, which is how a plan they do not own
		// reaches this function.
		expect(
			getPlanExpiryStatus( makeSite( { user_is_owner: false } ), undefined, 'en' )
		).toBeNull();
	} );
} );
