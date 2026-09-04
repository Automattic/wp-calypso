/**
 * @jest-environment jsdom
 */

import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import MockDate from 'mockdate';
import nock from 'nock';
import { isPlanExpiryNoticeDismissed, useSiteExpiryNotice } from '../use-site-expiry-notice';
import type { Purchase } from '@automattic/api-core';

const NOW = '2026-02-24T12:00:00Z';
const SITE_ID = 99;

function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
		product_slug: DotcomPlans.BUSINESS,
		product_name: 'WordPress.com Business',
		site_slug: 'example.wordpress.com',
		expiry_date: expiryInDays( 30 ),
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

function mockApi( {
	purchases,
	meta = {},
	transferStatus,
	transferDelay = 0,
}: {
	purchases: Purchase[];
	meta?: Record< string, number >;
	transferStatus?: string;
	transferDelay?: number;
} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases )
		.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.reply( 200, { id: 1, name: 'me', slug: 'me', meta } )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.delay( transferDelay )
		.reply( 200, transferStatus ? { status: transferStatus, created_at: NOW } : {} );
}

function renderNotice( options = { isDashboardScreen: false, locale: 'en' } ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const rendered = renderHook( () => useSiteExpiryNotice( SITE_ID, options ), {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	} );
	const waitForPurchases = () =>
		waitFor( () =>
			expect( queryClient.getQueryData( [ 'upgrades', 'site', SITE_ID ] ) ).toBeDefined()
		);
	const waitForCurrentUser = () =>
		waitFor( () =>
			expect( queryClient.getQueryData( [ 'site', SITE_ID, 'users', 'current' ] ) ).toBeDefined()
		);
	return { ...rendered, waitForPurchases, waitForCurrentUser };
}

beforeEach( () => MockDate.set( NOW ) );
afterEach( () => {
	MockDate.reset();
	nock.cleanAll();
} );

describe( 'useSiteExpiryNotice', () => {
	test( 'is null while loading and null with no eligible plan', async () => {
		mockApi( { purchases: [] } );
		const { result, waitForPurchases } = renderNotice();
		expect( result.current ).toBeNull();
		await waitForPurchases();
		expect( result.current ).toBeNull();
	} );

	test( 'hides the early warning off dashboard screens', async () => {
		mockApi( { purchases: [ makePurchase() ] } );
		const { result, waitForPurchases } = renderNotice( { isDashboardScreen: false, locale: 'en' } );
		await waitForPurchases();
		expect( result.current ).toBeNull();
	} );

	test( 'shows the early warning on dashboard screens', async () => {
		mockApi( { purchases: [ makePurchase() ] } );
		const { result } = renderNotice( { isDashboardScreen: true, locale: 'en' } );
		await waitFor( () => expect( result.current?.stage ).toBe( 'early-warning' ) );
		expect( result.current?.isDismissible ).toBe( false );
	} );

	test( 'shows the final window everywhere', async () => {
		mockApi( { purchases: [ makePurchase( { expiry_date: expiryInDays( 3 ) } ) ] } );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current?.stage ).toBe( 'final-window' ) );
	} );

	test( 'post-grace is dismissible and reads the reverted transfer', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -40 ),
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			transferStatus: 'reverted',
		} );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current?.isReverted ).toBe( true ) );
		expect( result.current?.stage ).toBe( 'post-grace' );
		expect( result.current?.isDismissible ).toBe( true );
		expect( result.current?.notice.primaryAction?.type ).toBe( 'contact-support' );
	} );

	test( 'stays null in post-grace until the transfer status resolves', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -40 ),
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			transferStatus: 'reverted',
			transferDelay: 50,
		} );
		const { result, waitForCurrentUser } = renderNotice();
		await waitForCurrentUser();
		expect( result.current ).toBeNull();
		await waitFor( () => expect( result.current?.isReverted ).toBe( true ) );
	} );

	test( 'a dismissal newer than the expiry date hides post-grace', async () => {
		const expiry = expiryInDays( -40 );
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiry,
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			meta: {
				wpcom_plan_expiry_notice_dismiss_wp_admin:
					Math.floor( new Date( expiry ).getTime() / 1000 ) + 86400,
			},
		} );
		const { result, waitForCurrentUser } = renderNotice();
		await waitForCurrentUser();
		expect( result.current ).toBeNull();
	} );
} );

describe( 'isPlanExpiryNoticeDismissed', () => {
	const purchase = makePurchase( { expiry_date: expiryInDays( -40 ) } );
	const expirySeconds = Math.floor( new Date( purchase.expiry_date ).getTime() / 1000 );

	test( 'false without a stamp', () => {
		expect( isPlanExpiryNoticeDismissed( undefined, purchase ) ).toBe( false );
	} );

	test( 'false for a stamp from before this term expired', () => {
		expect( isPlanExpiryNoticeDismissed( expirySeconds - 1, purchase ) ).toBe( false );
	} );

	test( 'true for a stamp after the expiry date', () => {
		expect( isPlanExpiryNoticeDismissed( expirySeconds + 1, purchase ) ).toBe( true );
	} );
} );
