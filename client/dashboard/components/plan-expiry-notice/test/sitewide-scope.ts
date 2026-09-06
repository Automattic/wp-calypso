/**
 * @jest-environment jsdom
 */

import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { translationExists } from '@automattic/i18n-utils';
import MockDate from 'mockdate';
import {
	getPlanExpiryNotice,
	isEligibleForPlanExpiryNotice,
	pickSitewideExpiryPurchase,
} from '../get-plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	translationExists: jest.fn( () => true ),
} ) );

const NOW = '2026-02-24T12:00:00Z';

function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
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

const sitewide = ( purchase: Purchase, extra = {} ) =>
	getPlanExpiryNotice( purchase, { scope: 'sitewide', viewOtherPlansUrl: '/plans/x', ...extra } );

const monthly = ( overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		product_slug: DotcomPlans.BUSINESS_MONTHLY,
		bill_period_days: SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
		...overrides,
	} );

const renewing = ( overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		expiry_status: 'active',
		is_auto_renew_enabled: true,
		might_still_auto_renew: true,
		...overrides,
	} );

const removed = ( daysAgo: number, overrides: Partial< Purchase > = {} ) =>
	makePurchase( {
		expiry_date: expiryInDays( -daysAgo ),
		expiry_status: 'expired',
		subscription_status: 'inactive',
		...overrides,
	} );

beforeEach( () => {
	MockDate.set( NOW );
	jest.mocked( translationExists ).mockReturnValue( true );
} );
afterEach( () => MockDate.reset() );

describe( 'sitewide scope: annual plan, auto-renew off', () => {
	test( '61 days out: nothing', () => {
		expect( sitewide( makePurchase( { expiry_date: expiryInDays( 61 ) } ) ) ).toBeNull();
	} );

	test( '60 days out: early warning naming the date, renew action', () => {
		const notice = sitewide( makePurchase( { expiry_date: expiryInDays( 60 ) } ) );
		expect( notice?.stage ).toBe( 'early-warning' );
		expect( notice?.variant ).toBe( 'warning' );
		expect( notice?.title ).toBe( 'Your Business plan expires in 60 days' );
		expect( notice?.body ).toMatch( /^After April 25, 2026, your site will move to the Free plan/ );
		expect( notice?.primaryAction ).toMatchObject( { type: 'renew', label: 'Renew now' } );
		expect( notice?.secondaryAction ).toBeUndefined();
	} );

	test( '8 days out is still the early warning', () => {
		expect( sitewide( makePurchase( { expiry_date: expiryInDays( 8 ) } ) )?.stage ).toBe(
			'early-warning'
		);
	} );

	test( '7 days out: final window', () => {
		const notice = sitewide( makePurchase( { expiry_date: expiryInDays( 7 ) } ) );
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.body ).toMatch( /^Your site will move to the Free plan and you’ll lose/ );
	} );

	test( 'expiry day: final window with the "unless you renew" body', () => {
		const notice = sitewide( makePurchase( { expiry_date: expiryInDays( 0 ) } ) );
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.title ).toBe( 'Your Business plan expires today' );
		expect( notice?.body ).toMatch( /^Unless you renew your plan/ );
	} );
} );

describe( 'sitewide scope: annual plan, auto-renew on', () => {
	test( '30 days out, no attempt yet: nothing', () => {
		expect( sitewide( renewing( { expiry_date: expiryInDays( 30 ) } ) ) ).toBeNull();
	} );

	test( '30 days out, past the first attempt: early warning with days remaining', () => {
		const notice = sitewide(
			renewing( { expiry_date: expiryInDays( 30 ), is_past_first_auto_renew_attempt_date: true } )
		);
		expect( notice?.stage ).toBe( 'early-warning' );
		expect( notice?.title ).toBe( 'Your Business plan has 30 days remaining' );
		expect( notice?.body ).toMatch( /^If renewal doesn’t go through/ );
	} );

	test( '7 days out, past the first attempt: final window', () => {
		const notice = sitewide(
			renewing( { expiry_date: expiryInDays( 7 ), is_past_first_auto_renew_attempt_date: true } )
		);
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.title ).toBe( 'Your Business plan has 7 days remaining' );
	} );

	test( '30 days out but billing will not renew: early warning', () => {
		const notice = sitewide(
			makePurchase( {
				expiry_date: expiryInDays( 30 ),
				is_auto_renew_enabled: true,
				might_still_auto_renew: false,
			} )
		);
		expect( notice?.stage ).toBe( 'early-warning' );
	} );
} );

describe( 'sitewide scope: monthly plan', () => {
	test( '8 days out, auto-renew off: nothing', () => {
		expect( sitewide( monthly( { expiry_date: expiryInDays( 8 ) } ) ) ).toBeNull();
	} );

	test( '7 days out, auto-renew off: final window with renew action', () => {
		const notice = sitewide( monthly( { expiry_date: expiryInDays( 7 ) } ) );
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.primaryAction ).toMatchObject( { type: 'renew' } );
	} );

	test( '7 days out, renewing normally: nothing', () => {
		expect(
			sitewide(
				monthly( {
					expiry_date: expiryInDays( 7 ),
					expiry_status: 'active',
					is_auto_renew_enabled: true,
					might_still_auto_renew: true,
					is_past_first_auto_renew_attempt_date: true,
				} )
			)
		).toBeNull();
	} );

	test( 'never offers "Turn on auto-renew"', () => {
		[ 60, 30, 7, 0 ].forEach( ( days ) => {
			const notice = sitewide( monthly( { expiry_date: expiryInDays( days ) } ) );
			expect( notice?.primaryAction?.type ).not.toBe( 'enable-auto-renew' );
			expect( notice?.primaryAction?.type ).not.toBe( 'add-payment-method' );
		} );
	} );
} );

describe( 'sitewide scope: grace period', () => {
	const grace = ( overrides: Partial< Purchase > = {} ) =>
		makePurchase( {
			expiry_date: expiryInDays( -1 ),
			expiry_status: 'expired',
			subscription_status: 'active',
			...overrides,
		} );

	test( 'expired yesterday: grace stage with both actions', () => {
		const notice = sitewide( grace() );
		expect( notice?.stage ).toBe( 'grace' );
		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
		expect( notice?.primaryAction ).toMatchObject( { type: 'renew', label: 'Renew now' } );
		expect( notice?.secondaryAction ).toMatchObject( {
			type: 'view-other-plans',
			href: '/plans/x',
		} );
	} );

	test( 'still offers "View other plans" when its label is untranslated', () => {
		jest.mocked( translationExists ).mockReturnValue( false );
		expect( sitewide( grace() )?.secondaryAction ).toMatchObject( {
			type: 'view-other-plans',
			href: '/plans/x',
		} );
	} );

	test( 'auto-renew still possible softens the body', () => {
		expect(
			sitewide( grace( { is_auto_renew_enabled: true, might_still_auto_renew: true } ) )?.body
		).toMatch( /^If renewal doesn’t go through/ );
	} );

	test( 'a removed subscription 29 days past expiry is still grace', () => {
		expect( sitewide( removed( 29 ) )?.stage ).toBe( 'grace' );
	} );

	test( 'classification is date-only: a stale manual-renew status is still grace', () => {
		const notice = sitewide(
			makePurchase( {
				expiry_date: expiryInDays( -20 ),
				expiry_status: 'manual-renew',
				subscription_status: 'active',
			} )
		);
		expect( notice?.stage ).toBe( 'grace' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
	} );
} );

describe( 'sitewide scope: post-grace', () => {
	test( '30 days past, not reverted: restore-site action', () => {
		const notice = sitewide( removed( 30 ) );
		expect( notice?.stage ).toBe( 'post-grace' );
		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
		expect( notice?.body ).toBe(
			'Your site has been moved to the Free plan. You no longer have access to plugins, custom themes, or 50 GB of storage. Upgrade your plan to restore your site.'
		);
		expect( notice?.primaryAction?.type ).toBe( 'restore-site' );
		expect( notice?.primaryAction ).toMatchObject( { label: 'Restore site' } );
		const href =
			notice?.primaryAction && 'href' in notice.primaryAction && notice.primaryAction.href;
		expect( href ).toContain( '/checkout/example.wordpress.com/business-bundle' );
		expect( notice?.secondaryAction ).toBeUndefined();
	} );

	test( '30 days past, not reverted: restore link carries the return URL both ways', () => {
		const notice = sitewide( removed( 30 ), { renewReturnUrl: '/home/example' } );
		const href =
			notice?.primaryAction && 'href' in notice.primaryAction && notice.primaryAction.href;
		expect( href ).toContain( `redirect_to=${ encodeURIComponent( '/home/example' ) }` );
		expect( href ).toContain( `cancel_to=${ encodeURIComponent( '/home/example' ) }` );
	} );

	test( '30 days past, reverted: contact-support action with prefilled message', () => {
		const notice = sitewide( removed( 30 ), { isReverted: true } );
		expect( notice?.body ).toBe(
			'Your site has been moved to the Free plan and set to private. You no longer have access to plugins, custom themes, or 50 GB of storage. Contact support to get help restoring it.'
		);
		expect( notice?.primaryAction ).toEqual( {
			type: 'contact-support',
			label: 'Contact support',
			message: 'My Business plan expired and I need your help getting it restored.',
		} );
	} );

	test( '59 days past: still post-grace', () => {
		expect( sitewide( removed( 59 ) )?.stage ).toBe( 'post-grace' );
	} );

	test( '60 days past: nothing', () => {
		expect( sitewide( removed( 60 ) ) ).toBeNull();
	} );
} );

describe( 'sitewide scope: eligibility and fallbacks', () => {
	test( 'removed subscriptions are eligible in sitewide scope only', () => {
		expect( isEligibleForPlanExpiryNotice( removed( 30 ) ) ).toBe( false );
		expect( isEligibleForPlanExpiryNotice( removed( 30 ), 'sitewide' ) ).toBe( true );
	} );

	test( 'partner-managed plans stay excluded', () => {
		expect(
			sitewide( makePurchase( { expiry_date: expiryInDays( 7 ), partner_type: 'a4a' } ) )
		).toBeNull();
	} );

	test( 'the purchase scope is unchanged: still shows the info variant beyond 60 days', () => {
		expect(
			getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 61 ) } ) )?.variant
		).toBe( 'info' );
	} );

	test( 'the purchase scope has no stage', () => {
		expect(
			getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 7 ) } ) )?.stage
		).toBeUndefined();
	} );
} );

describe( 'pickSitewideExpiryPurchase', () => {
	test( 'returns null with no eligible plan', () => {
		expect( pickSitewideExpiryPurchase( [] ) ).toBeNull();
		expect(
			pickSitewideExpiryPurchase( [
				makePurchase( { product_slug: 'domain_reg', is_plan: false } ),
			] )
		).toBeNull();
	} );

	test( 'picks the plan with the latest expiry date', () => {
		const older = makePurchase( { ID: 1, expiry_date: expiryInDays( -40 ) } );
		const newer = makePurchase( { ID: 2, expiry_date: expiryInDays( 10 ) } );
		expect( pickSitewideExpiryPurchase( [ older, newer ] ) ).toBe( newer );
	} );

	test( 'includes removed subscriptions', () => {
		const gone = removed( 35 );
		expect( pickSitewideExpiryPurchase( [ gone ] ) ).toBe( gone );
	} );

	test( 'skips partner-managed plans', () => {
		expect( pickSitewideExpiryPurchase( [ makePurchase( { partner_type: 'a4a' } ) ] ) ).toBeNull();
	} );
} );
