/**
 * @jest-environment jsdom
 */

import { DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import MockDate from 'mockdate';
import nock from 'nock';
import { useSiteExpiryNotice } from '../use-site-expiry-notice';
import type { SiteExpiryNoticeOptions } from '../use-site-expiry-notice';
import type { Purchase } from '@automattic/api-core';

const NOW = '2026-02-24T12:00:00Z';
const SITE_ID = 99;
const OWNER_ID = 7;

function expiryInDays( days: number ): string {
	return new Date( Date.UTC( 2026, 1, 24 + days, 12 ) ).toISOString();
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1234,
		blog_id: SITE_ID,
		user_id: OWNER_ID,
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
	metaDelay = 0,
	transferStatus,
	transferDelay = 0,
	transferStatusCode = 200,
}: {
	purchases: Purchase[];
	meta?: Record< string, number >;
	metaDelay?: number;
	transferStatus?: string;
	transferDelay?: number;
	transferStatusCode?: number;
} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases )
		.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
		.query( true )
		.delay( metaDelay )
		.reply( 200, { id: 1, name: 'me', slug: 'me', meta } )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.delay( transferDelay )
		.reply( transferStatusCode, transferStatus ? { status: transferStatus, created_at: NOW } : {} );
}

function renderNotice(
	options: SiteExpiryNoticeOptions = {
		isDashboardScreen: false,
		currentUserId: OWNER_ID,
		isAtomic: true,
		locale: 'en',
	},
	// Off by default so that a mocked failure fails a test fast. The transfer
	// query has to opt out of retries on its own; one test checks that it does.
	{ retry = false }: { retry?: boolean } = {}
) {
	// `retryDelay: 0` keeps the transfer query's own retries from adding
	// TanStack's exponential backoff to a test's runtime.
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry, retryDelay: 0 } },
	} );
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
	const waitForTransferError = () =>
		waitFor( () =>
			expect(
				queryClient.getQueryState( [ 'site', SITE_ID, 'atomic', 'transfers', 'latest' ] )?.status
			).toBe( 'error' )
		);
	return { ...rendered, waitForPurchases, waitForCurrentUser, waitForTransferError };
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

	test( 'another user’s plan shows, flagged as not the owner', async () => {
		mockApi( {
			purchases: [ makePurchase( { user_id: OWNER_ID + 1, expiry_date: expiryInDays( 3 ) } ) ],
		} );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current?.stage ).toBe( 'final-window' ) );
		expect( result.current?.isPlanOwner ).toBe( false );
	} );

	test( 'hides the early warning off dashboard screens', async () => {
		mockApi( { purchases: [ makePurchase() ] } );
		const { result, waitForPurchases } = renderNotice( {
			isDashboardScreen: false,
			currentUserId: OWNER_ID,
			isAtomic: true,
			locale: 'en',
		} );
		await waitForPurchases();
		expect( result.current ).toBeNull();
	} );

	test( 'shows the early warning on dashboard screens', async () => {
		mockApi( { purchases: [ makePurchase() ] } );
		const { result } = renderNotice( {
			isDashboardScreen: true,
			currentUserId: OWNER_ID,
			isAtomic: true,
			locale: 'en',
		} );
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
			meta: { wp_wpcom_plan_expiry_notice_dismiss: 0 },
		} );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current?.isReverted ).toBe( true ) );
		expect( result.current?.stage ).toBe( 'post-grace' );
		expect( result.current?.isDismissible ).toBe( true );
		expect( result.current?.dismissMetaKey ).toBe( 'wp_wpcom_plan_expiry_notice_dismiss' );
	} );

	test( 'post-grace on an Atomic site that is not reverted is rendered as grace', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -40 ),
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			transferStatus: 'completed',
		} );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( result.current?.stage ).toBe( 'grace' );
		expect( result.current?.isDismissible ).toBe( false );
	} );

	test( 'post-grace on a Simple site with no transfer record: restore path, dismissible', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -40 ),
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			transferStatusCode: 404,
			meta: { wp_123_wpcom_plan_expiry_notice_dismiss: 0 },
		} );
		const { result } = renderNotice(
			{ isDashboardScreen: false, currentUserId: OWNER_ID, isAtomic: false, locale: 'en' },
			{ retry: true }
		);
		await waitFor( () => expect( result.current?.stage ).toBe( 'post-grace' ), { timeout: 1000 } );
		expect( result.current?.isReverted ).toBe( false );
		expect( result.current?.isDismissible ).toBe( true );
		expect( result.current?.dismissMetaKey ).toBe( 'wp_123_wpcom_plan_expiry_notice_dismiss' );
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

	test( 'stays null in post-grace until the dismissal meta is known', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -40 ),
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			// Never dismissed, so the only thing holding the notice back is the
			// meta not having arrived yet.
			meta: { wp_wpcom_plan_expiry_notice_dismiss: 0 },
			metaDelay: 50,
			transferStatus: 'reverted',
		} );
		const { result, waitForPurchases } = renderNotice();
		await waitForPurchases();
		expect( result.current ).toBeNull();
		await waitFor( () => expect( result.current?.stage ).toBe( 'post-grace' ) );
	} );

	test( 'stays null in post-grace when the transfer lookup fails', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( -40 ),
					expiry_status: 'expired',
					subscription_status: 'inactive',
				} ),
			],
			transferStatusCode: 500,
		} );
		const { result, waitForCurrentUser, waitForTransferError } = renderNotice();
		await waitForCurrentUser();
		await waitForTransferError();
		expect( result.current ).toBeNull();
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
				wp_wpcom_plan_expiry_notice_dismiss:
					Math.floor( new Date( expiry ).getTime() / 1000 ) + 86400,
			},
			transferStatus: 'reverted',
		} );
		const { result, waitForCurrentUser } = renderNotice();
		await waitForCurrentUser();
		expect( result.current ).toBeNull();
	} );

	test( 'is null after purchases load for an auto-renewing annual plan before its first attempt', async () => {
		mockApi( {
			purchases: [
				makePurchase( {
					expiry_date: expiryInDays( 30 ),
					expiry_status: 'active',
					is_auto_renew_enabled: true,
					might_still_auto_renew: true,
					is_past_first_auto_renew_attempt_date: false,
				} ),
			],
		} );
		const { result, waitForPurchases } = renderNotice( {
			isDashboardScreen: true,
			currentUserId: OWNER_ID,
			isAtomic: true,
			locale: 'en',
		} );
		await waitForPurchases();
		expect( result.current ).toBeNull();
	} );
} );
