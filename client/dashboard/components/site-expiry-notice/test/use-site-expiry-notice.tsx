/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import MockDate from 'mockdate';
import nock from 'nock';
import {
	NOW,
	OWNER_ID,
	SITE_ID,
	expiryInDays,
	makePurchase,
	postGrace,
	renewing,
} from '../../plan-expiry-notice/test/fixtures';
import { useSiteExpiryNotice } from '../use-site-expiry-notice';
import type { SiteExpiryNoticeOptions } from '../use-site-expiry-notice';
import type { Purchase } from '@automattic/api-core';

const DISMISS_KEY = 'wp_wpcom_plan_expiry_notice_dismiss';
const PURCHASES_KEY = [ 'upgrades', 'site', SITE_ID ];
const CURRENT_USER_KEY = [ 'site', SITE_ID, 'users', 'current' ];
const TRANSFER_KEY = [ 'site', SITE_ID, 'atomic', 'transfers', 'latest' ];

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
	options: Partial< SiteExpiryNoticeOptions > = {},
	// Off by default so that a mocked failure fails a test fast. The transfer
	// query has to opt out of retries on its own; one test checks that it does.
	// `retryDelay: 0` keeps those retries from adding exponential backoff.
	{ retry = false }: { retry?: boolean } = {}
) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry, retryDelay: 0 } } } );
	const rendered = renderHook(
		() =>
			useSiteExpiryNotice( SITE_ID, {
				isDashboardScreen: false,
				currentUserId: OWNER_ID,
				isAtomic: true,
				locale: 'en',
				...options,
			} ),
		{
			wrapper: ( { children } ) => (
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			),
		}
	);
	const waitForData = ( key: unknown[] ) =>
		waitFor( () => expect( queryClient.getQueryData( key ) ).toBeDefined() );
	const waitForTransferError = () =>
		waitFor( () => expect( queryClient.getQueryState( TRANSFER_KEY )?.status ).toBe( 'error' ) );
	return { ...rendered, waitForData, waitForTransferError };
}

beforeEach( () => MockDate.set( NOW ) );
afterEach( () => {
	MockDate.reset();
	nock.cleanAll();
} );

describe( 'useSiteExpiryNotice', () => {
	test( 'is null while loading and null with no eligible plan', async () => {
		mockApi( { purchases: [] } );
		const { result, waitForData } = renderNotice();
		expect( result.current ).toBeNull();
		await waitForData( PURCHASES_KEY );
		expect( result.current ).toBeNull();
	} );

	test( 'is null for an auto-renewing annual plan before its first attempt', async () => {
		mockApi( { purchases: [ renewing( { expiry_date: expiryInDays( 30 ) } ) ] } );
		const { result, waitForData } = renderNotice( { isDashboardScreen: true } );
		await waitForData( PURCHASES_KEY );
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

	test( 'the early warning shows on dashboard screens only', async () => {
		mockApi( { purchases: [ makePurchase( { expiry_date: expiryInDays( 30 ) } ) ] } );

		const off = renderNotice( { isDashboardScreen: false } );
		await off.waitForData( PURCHASES_KEY );
		expect( off.result.current ).toBeNull();

		const on = renderNotice( { isDashboardScreen: true } );
		await waitFor( () => expect( on.result.current?.stage ).toBe( 'early-warning' ) );
		expect( on.result.current?.isDismissible ).toBe( false );
	} );

	test( 'shows the final window everywhere', async () => {
		mockApi( { purchases: [ makePurchase( { expiry_date: expiryInDays( 3 ) } ) ] } );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current?.stage ).toBe( 'final-window' ) );
	} );

	test( 'post-grace is dismissible and reads the reverted transfer', async () => {
		mockApi( {
			purchases: [ postGrace() ],
			transferStatus: 'reverted',
			meta: { [ DISMISS_KEY ]: 0 },
		} );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current?.isReverted ).toBe( true ) );
		expect( result.current?.stage ).toBe( 'post-grace' );
		expect( result.current?.isDismissible ).toBe( true );
		expect( result.current?.dismissMetaKey ).toBe( DISMISS_KEY );
	} );

	test( 'post-grace on an Atomic site that is not reverted is rendered as grace', async () => {
		mockApi( { purchases: [ postGrace() ], transferStatus: 'completed' } );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( result.current?.stage ).toBe( 'grace' );
		expect( result.current?.isDismissible ).toBe( false );
	} );

	test( 'post-grace on a Simple site with no transfer record: restore path, dismissible', async () => {
		mockApi( {
			purchases: [ postGrace() ],
			transferStatusCode: 404,
			meta: { wp_123_wpcom_plan_expiry_notice_dismiss: 0 },
		} );
		const { result } = renderNotice( { isAtomic: false }, { retry: true } );
		await waitFor( () => expect( result.current?.stage ).toBe( 'post-grace' ), { timeout: 1000 } );
		expect( result.current?.isReverted ).toBe( false );
		expect( result.current?.isDismissible ).toBe( true );
		expect( result.current?.dismissMetaKey ).toBe( 'wp_123_wpcom_plan_expiry_notice_dismiss' );
	} );

	test( 'stays null in post-grace until the transfer status resolves', async () => {
		mockApi( { purchases: [ postGrace() ], transferStatus: 'reverted', transferDelay: 50 } );
		const { result, waitForData } = renderNotice();
		await waitForData( CURRENT_USER_KEY );
		expect( result.current ).toBeNull();
		await waitFor( () => expect( result.current?.isReverted ).toBe( true ) );
	} );

	test( 'stays null in post-grace until the dismissal meta is known', async () => {
		mockApi( {
			purchases: [ postGrace() ],
			// Never dismissed, so the only thing holding the notice back is the
			// meta not having arrived yet.
			meta: { [ DISMISS_KEY ]: 0 },
			metaDelay: 50,
			transferStatus: 'reverted',
		} );
		const { result, waitForData } = renderNotice();
		await waitForData( PURCHASES_KEY );
		expect( result.current ).toBeNull();
		await waitFor( () => expect( result.current?.stage ).toBe( 'post-grace' ) );
	} );

	test( 'stays null in post-grace when the transfer lookup fails', async () => {
		mockApi( { purchases: [ postGrace() ], transferStatusCode: 500 } );
		const { result, waitForData, waitForTransferError } = renderNotice();
		await waitForData( CURRENT_USER_KEY );
		await waitForTransferError();
		expect( result.current ).toBeNull();
	} );

	test( 'a dismissal newer than the expiry date hides post-grace', async () => {
		const purchase = postGrace();
		mockApi( {
			purchases: [ purchase ],
			meta: {
				[ DISMISS_KEY ]: Math.floor( new Date( purchase.expiry_date ).getTime() / 1000 ) + 86400,
			},
			transferStatus: 'reverted',
		} );
		const { result, waitForData } = renderNotice();
		await waitForData( CURRENT_USER_KEY );
		expect( result.current ).toBeNull();
	} );
} );
