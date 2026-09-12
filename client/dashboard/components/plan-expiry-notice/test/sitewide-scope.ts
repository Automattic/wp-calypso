/**
 * @jest-environment jsdom
 */

import { translationExists } from '@automattic/i18n-utils';
import MockDate from 'mockdate';
import {
	getExpiryStateName,
	getPlanExpiryNotice,
	getSitewideExpiryStage,
	isEligibleForPlanExpiryNotice,
	pickSitewideExpiryPurchase,
} from '../get-plan-expiry-notice';
import {
	NOW,
	OWNER_ID,
	expiryInDays,
	grace,
	makePurchase,
	monthly,
	removed,
	renewing,
} from './fixtures';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	translationExists: jest.fn( () => true ),
} ) );

const sitewide = ( purchase: Purchase, extra = {} ) =>
	getPlanExpiryNotice( purchase, { scope: 'sitewide', viewOtherPlansUrl: '/plans/x', ...extra } );

const hrefOf = ( action: unknown ) =>
	action && typeof action === 'object' && 'href' in action ? String( action.href ) : undefined;

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
} );

describe( 'sitewide scope: monthly plan', () => {
	test( 'silent 8 days out, final window at 7', () => {
		expect( sitewide( monthly( { expiry_date: expiryInDays( 8 ) } ) ) ).toBeNull();
		const notice = sitewide( monthly( { expiry_date: expiryInDays( 7 ) } ) );
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.primaryAction ).toMatchObject( { type: 'renew' } );
	} );

	test( 'renewing normally: nothing', () => {
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
		const notice = sitewide( monthly( { expiry_date: expiryInDays( 7 ) } ) );
		expect( notice?.primaryAction?.type ).not.toBe( 'enable-auto-renew' );
		expect( notice?.primaryAction?.type ).not.toBe( 'add-payment-method' );
	} );
} );

describe( 'sitewide scope: grace period', () => {
	test( 'expired yesterday: grace stage with both actions, even untranslated', () => {
		const notice = sitewide( grace() );
		expect( notice?.stage ).toBe( 'grace' );
		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
		expect( notice?.primaryAction ).toMatchObject( { type: 'renew', label: 'Renew now' } );
		expect( notice?.secondaryAction ).toMatchObject( {
			type: 'view-other-plans',
			href: '/plans/x',
		} );

		jest.mocked( translationExists ).mockReturnValue( false );
		expect( sitewide( grace() )?.secondaryAction ).toMatchObject( { type: 'view-other-plans' } );
	} );

	test( 'classification is status-based: 45 days past expiry but still active is grace', () => {
		expect( sitewide( grace( { expiry_date: expiryInDays( -45 ) } ) )?.stage ).toBe( 'grace' );
	} );

	test( 'past the date with a stale manual-renew status reads as expiring today', () => {
		const notice = sitewide(
			grace( { expiry_date: expiryInDays( -2 ), expiry_status: 'manual-renew' } )
		);
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.title ).toBe( 'Your Business plan expires today' );
	} );
} );

describe( 'sitewide scope: post-grace', () => {
	test( 'not reverted: restore-site action carrying the return URL both ways', () => {
		const notice = sitewide( removed( 30 ), { renewReturnUrl: '/home/example' } );
		expect( notice?.stage ).toBe( 'post-grace' );
		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
		expect( notice?.body ).toBe(
			'Your site has been moved to the Free plan. You no longer have access to plugins, custom themes, or 50 GB of storage. Upgrade your plan to restore your site.'
		);
		expect( notice?.primaryAction ).toMatchObject( {
			type: 'restore-site',
			label: 'Restore site',
		} );
		const href = hrefOf( notice?.primaryAction );
		expect( href ).toContain( '/checkout/example.wordpress.com/business-bundle' );
		expect( href ).toContain( `redirect_to=${ encodeURIComponent( '/home/example' ) }` );
		expect( href ).toContain( `cancel_to=${ encodeURIComponent( '/home/example' ) }` );
		expect( notice?.secondaryAction ).toBeUndefined();
	} );

	test( 'reverted: contact-support action with prefilled message', () => {
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

	test( 'runs out 60 days past the expiry date', () => {
		expect( sitewide( removed( 59 ) )?.stage ).toBe( 'post-grace' );
		expect( sitewide( removed( 60 ) ) ).toBeNull();
	} );

	test( 'removed 5 days past expiry is already post-grace; removed before it is nothing', () => {
		expect( sitewide( removed( 5 ) )?.stage ).toBe( 'post-grace' );
		expect( sitewide( removed( -10 ) ) ).toBeNull();
	} );

	test( 'overridden to grace: the grace body, restore-site, no secondary action', () => {
		const notice = sitewide( removed( 40 ), { stage: 'grace' } );
		expect( notice?.stage ).toBe( 'grace' );
		expect( notice?.variant ).toBe( 'error' );
		expect( notice?.title ).toBe( 'Your Business plan has expired' );
		expect( notice?.body ).toMatch(
			/^Your site will move to the Free plan. That means losing plugins, custom themes, and 50 GB of storage/
		);
		expect( notice?.primaryAction ).toMatchObject( {
			type: 'restore-site',
			label: 'Restore site',
		} );
		expect( notice?.secondaryAction ).toBeUndefined();
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

	test( 'the purchase scope is unchanged: info beyond 60 days, no stage, ignores isPlanOwner', () => {
		expect(
			getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 61 ) } ) )?.variant
		).toBe( 'info' );
		const notice = getPlanExpiryNotice( makePurchase( { expiry_date: expiryInDays( 3 ) } ), {
			isPlanOwner: false,
		} );
		expect( notice?.stage ).toBeUndefined();
		expect( notice?.primaryAction ).toMatchObject( { type: 'renew' } );
	} );
} );

describe( 'pickSitewideExpiryPurchase', () => {
	test( 'returns null with no eligible plan, and skips partner-managed ones', () => {
		expect( pickSitewideExpiryPurchase( [] ) ).toBeNull();
		expect(
			pickSitewideExpiryPurchase( [
				makePurchase( { product_slug: 'domain_reg', is_plan: false } ),
			] )
		).toBeNull();
		expect( pickSitewideExpiryPurchase( [ makePurchase( { partner_type: 'a4a' } ) ] ) ).toBeNull();
	} );

	test( 'picks the latest expiry date, including removed plans and other owners', () => {
		const older = removed( 35, { ID: 1 } );
		const newer = makePurchase( { ID: 2, expiry_date: expiryInDays( 10 ), user_id: OWNER_ID + 1 } );
		expect( pickSitewideExpiryPurchase( [ older, newer ] ) ).toBe( newer );
		expect( pickSitewideExpiryPurchase( [ older ] ) ).toBe( older );
	} );
} );

describe( 'sitewide scope: non-owner', () => {
	const nonOwnerBody =
		'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.';

	test( 'keeps the heading, swaps the body, offers no actions', () => {
		const notice = sitewide( makePurchase( { expiry_date: expiryInDays( 3 ) } ), {
			isPlanOwner: false,
		} );
		expect( notice?.stage ).toBe( 'final-window' );
		expect( notice?.title ).toBe( 'Your Business plan expires in 3 days' );
		expect( notice?.body ).toBe( nonOwnerBody );
		expect( notice?.primaryAction ).toBeUndefined();
		expect( notice?.secondaryAction ).toBeUndefined();

		const postGraceNotice = sitewide( removed( 30 ), { isPlanOwner: false, isReverted: true } );
		expect( postGraceNotice?.title ).toBe( 'Your Business plan has expired' );
		expect( postGraceNotice?.body ).toBe( nonOwnerBody );
		expect( postGraceNotice?.primaryAction ).toBeUndefined();
	} );
} );

describe( 'getSitewideExpiryStage / getExpiryStateName', () => {
	test( 'maps stages to the wp-admin state names', () => {
		expect( getExpiryStateName( 'early-warning' ) ).toBe( 'approaching_expiry' );
		expect( getExpiryStateName( 'final-window' ) ).toBe( 'approaching_expiry' );
		expect( getExpiryStateName( 'grace' ) ).toBe( 'expired_grace' );
		expect( getExpiryStateName( 'post-grace' ) ).toBe( 'expired' );
	} );

	test( 'stage alone needs no copy, eligibility or a parseable date', () => {
		expect(
			getSitewideExpiryStage( makePurchase( { expiry_date: expiryInDays( 61 ) } ) )
		).toBeNull();
		expect( getSitewideExpiryStage( makePurchase( { expiry_date: expiryInDays( 60 ) } ) ) ).toBe(
			'early-warning'
		);
		expect( getSitewideExpiryStage( makePurchase( { expiry_date: expiryInDays( 7 ) } ) ) ).toBe(
			'final-window'
		);
		expect( getSitewideExpiryStage( removed( 59 ) ) ).toBe( 'post-grace' );
		expect( getSitewideExpiryStage( removed( 60 ) ) ).toBeNull();
		expect( getSitewideExpiryStage( makePurchase( { expiry_date: '' } ) ) ).toBeNull();
		expect( getSitewideExpiryStage( makePurchase( { expiry_date: 'not a date' } ) ) ).toBeNull();
	} );
} );
