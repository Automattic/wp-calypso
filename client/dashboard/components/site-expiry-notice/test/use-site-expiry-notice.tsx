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
	grace,
	makePurchase,
	renewing,
	revertedTransfer,
} from '../../plan-expiry-notice/test/fixtures';
import { useSiteExpiryNotice } from '../use-site-expiry-notice';
import type { SiteExpiryNoticeOptions } from '../use-site-expiry-notice';
import type { AtomicTransfer, Purchase } from '@automattic/api-core';

const DISMISS_KEY = 'wp_123_wpcom_plan_expiry_notice_dismiss';
const PURCHASES_KEY = [ 'upgrades', 'site', SITE_ID ];
const CURRENT_USER_KEY = [ 'site', SITE_ID, 'users', 'current' ];
const TRANSFER_KEY = [ 'site', SITE_ID, 'expiry-notice', 'transfer' ];

function revertedAtMs( transfer: AtomicTransfer ): number {
	const revertedAt = transfer.reverted_at;
	if ( ! revertedAt ) {
		throw new Error( 'Expected the fixture to set reverted_at' );
	}
	return new Date( revertedAt.replace( ' ', 'T' ) + 'Z' ).getTime();
}

function mockApi( {
	purchases,
	meta,
	transfer,
	transferStatusCode = transfer ? 200 : 404,
}: {
	purchases: Purchase[];
	meta?: Record< string, number >;
	transfer?: AtomicTransfer;
	transferStatusCode?: number;
} ) {
	const api = nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases )
		.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
		.query( true )
		.reply( transferStatusCode, transfer ?? { code: 'no_transfer_record' } );
	if ( meta ) {
		api
			.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
			.query( true )
			.reply( 200, { id: 1, name: 'me', slug: 'me', meta } );
	}
	return api;
}

function renderNotice( options: Partial< SiteExpiryNoticeOptions > = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, retryDelay: 0 } },
	} );
	const rendered = renderHook(
		() =>
			useSiteExpiryNotice( SITE_ID, {
				isDashboardScreen: false,
				currentUserId: OWNER_ID,
				isAtomic: false,
				locale: 'en',
				...options,
			} ),
		{
			wrapper: ( { children } ) => (
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			),
		}
	);
	const waitForSettled = ( key: unknown[] ) =>
		waitFor( () =>
			expect( [ 'success', 'error' ] ).toContain( queryClient.getQueryState( key )?.status )
		);
	return { ...rendered, queryClient, waitForSettled };
}

beforeEach( () => MockDate.set( NOW ) );
afterEach( () => MockDate.reset() );

describe( 'useSiteExpiryNotice: purchase states', () => {
	test( 'is null while loading and null with no plan and no revert', async () => {
		mockApi( { purchases: [] } );
		const { result, waitForSettled } = renderNotice();
		expect( result.current ).toBeNull();
		await waitForSettled( PURCHASES_KEY );
		await waitForSettled( TRANSFER_KEY );
		expect( result.current ).toBeNull();
	} );

	test( 'is null for an auto-renewing annual plan before its first attempt', async () => {
		mockApi( { purchases: [ renewing( { expiry_date: expiryInDays( 30 ) } ) ] } );
		const { result, waitForSettled } = renderNotice( { isDashboardScreen: true } );
		await waitForSettled( PURCHASES_KEY );
		expect( result.current ).toBeNull();
	} );

	test( 'another user’s plan shows, flagged as not the owner', async () => {
		mockApi( {
			purchases: [ makePurchase( { user_id: OWNER_ID + 1, expiry_date: expiryInDays( 3 ) } ) ],
		} );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( result.current ).toMatchObject( {
			kind: 'purchase',
			stage: 'final-window',
			isPlanOwner: false,
		} );
	} );

	test( 'the early warning shows on dashboard screens only', async () => {
		mockApi( { purchases: [ makePurchase( { expiry_date: expiryInDays( 30 ) } ) ] } );

		const off = renderNotice( { isDashboardScreen: false } );
		await off.waitForSettled( PURCHASES_KEY );
		expect( off.result.current ).toBeNull();

		const on = renderNotice( { isDashboardScreen: true } );
		await waitFor( () => expect( on.result.current ).toMatchObject( { stage: 'early-warning' } ) );
	} );

	test.each( [
		[
			'grace on an Atomic site',
			makePurchase( { expiry_date: expiryInDays( -45 ), expiry_status: 'expired' } ),
			true,
			'grace',
		],
		[
			'the final week on a Simple site',
			makePurchase( { expiry_date: expiryInDays( 3 ) } ),
			false,
			'final-window',
		],
	] )(
		'%s is not dismissible, and neither the transfer nor the meta is asked for',
		async ( _, purchase, isAtomic, stage ) => {
			mockApi( { purchases: [ purchase ], meta: { [ DISMISS_KEY ]: 0 } } );
			const { result, queryClient } = renderNotice( { isAtomic } );
			await waitFor( () => expect( result.current ).toMatchObject( { kind: 'purchase', stage } ) );
			expect( result.current ).not.toHaveProperty( 'dismissMetaKey' );
			for ( const key of [ TRANSFER_KEY, CURRENT_USER_KEY ] ) {
				const queryState = queryClient.getQueryState( key );
				expect( queryState?.fetchStatus ).toBe( 'idle' );
				expect( queryState?.dataUpdatedAt ).toBe( 0 );
			}
		}
	);
} );

describe( 'useSiteExpiryNotice: grace on a Simple site', () => {
	// `grace()` expires on 2026-02-23, so its term ends at that day's last UTC second.
	const cutoffSeconds = Date.UTC( 2026, 1, 23, 23, 59, 59 ) / 1000;

	const shown = expect.objectContaining( {
		kind: 'purchase',
		stage: 'grace',
		dismissMetaKey: DISMISS_KEY,
	} );

	test.each( [
		[ 'no stamp', 0, shown ],
		[ 'a stamp from before the expiry day ended', cutoffSeconds - 1, shown ],
		[ 'a stamp from after the expiry day ended', cutoffSeconds + 3600, null ],
	] )( 'with %s, the dismissible notice is honoured', async ( _, stamp, expected ) => {
		mockApi( { purchases: [ grace() ], meta: { [ DISMISS_KEY ]: stamp } } );
		const { result, waitForSettled } = renderNotice();
		await waitForSettled( CURRENT_USER_KEY );
		await waitFor( () => expect( result.current ).toEqual( expected ) );
	} );
} );

describe( 'useSiteExpiryNotice: reverted state', () => {
	test( 'a site reverted for an expired plan is post-grace with the dismiss key', async () => {
		const transfer = revertedTransfer( 10 );
		mockApi( { purchases: [], transfer, meta: { [ DISMISS_KEY ]: 0 } } );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current ).not.toBeNull() );
		expect( result.current ).toEqual( {
			kind: 'reverted',
			revertedAt: revertedAtMs( transfer ),
			dismissMetaKey: DISMISS_KEY,
		} );
	} );

	test( 'the reverted state is not offered on an Atomic site', async () => {
		mockApi( { purchases: [], transfer: revertedTransfer( 10 ), meta: {} } );
		const { result, queryClient, waitForSettled } = renderNotice( { isAtomic: true } );
		await waitForSettled( PURCHASES_KEY );
		expect( result.current ).toBeNull();
		const transferState = queryClient.getQueryState( TRANSFER_KEY );
		expect( transferState?.fetchStatus ).toBe( 'idle' );
		expect( transferState?.dataUpdatedAt ).toBe( 0 );
	} );

	test( 'a revert for another reason, or a completed transfer, is nothing', async () => {
		for ( const transfer of [
			revertedTransfer( 10, { reverted_for_expired_plan: false } ),
			revertedTransfer( 10, { status: 'completed', reverted_at: null } ),
		] ) {
			nock.cleanAll();
			mockApi( { purchases: [], transfer, meta: {} } );
			const { result, waitForSettled } = renderNotice();
			await waitForSettled( TRANSFER_KEY );
			expect( result.current ).toBeNull();
		}
	} );

	test( 'runs out 30 days after the revert', async () => {
		mockApi( { purchases: [], transfer: revertedTransfer( 29 ), meta: { [ DISMISS_KEY ]: 0 } } );
		const inWindow = renderNotice();
		await waitFor( () => expect( inWindow.result.current ).toMatchObject( { kind: 'reverted' } ) );

		nock.cleanAll();
		mockApi( { purchases: [], transfer: revertedTransfer( 30 ), meta: {} } );
		const outOfWindow = renderNotice();
		await outOfWindow.waitForSettled( TRANSFER_KEY );
		expect( outOfWindow.result.current ).toBeNull();
	} );

	test( 'a never-transferred site (404) is nothing, and the 404 is not refetched on mount', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.2/upgrades' )
			.query( true )
			.reply( 200, [] );
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
			.query( true )
			.reply( 404, { code: 'no_transfer_record' } );
		const second = nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfers/latest` )
			.query( true )
			.reply( 404, { code: 'no_transfer_record' } );

		const first = renderNotice();
		await first.waitForSettled( TRANSFER_KEY );
		expect( first.result.current ).toBeNull();
		expect( scope.isDone() ).toBe( true );

		const cached = first.queryClient.getQueryState( TRANSFER_KEY );
		expect( cached?.status ).toBe( 'success' );
		expect( cached?.data ).toBeNull();

		const again = renderHook(
			() =>
				useSiteExpiryNotice( SITE_ID, {
					isDashboardScreen: false,
					currentUserId: OWNER_ID,
					isAtomic: false,
					locale: 'en',
				} ),
			{
				wrapper: ( { children } ) => (
					<QueryClientProvider client={ first.queryClient }>{ children }</QueryClientProvider>
				),
			}
		);
		expect( again.result.current ).toBeNull();
		expect( first.queryClient.getQueryState( TRANSFER_KEY )?.fetchStatus ).toBe( 'idle' );
		expect( first.queryClient.getQueryState( TRANSFER_KEY )?.dataUpdatedAt ).toBe(
			cached?.dataUpdatedAt
		);
		// A second, unconsumed interceptor proves the cached answer served the
		// second mount without a request.
		expect( second.isDone() ).toBe( false );
	} );

	test( 'stays null until the dismissal meta has been fetched, then honours a newer stamp', async () => {
		const transfer = revertedTransfer( 10 );
		const revertedAtSeconds = Math.floor( revertedAtMs( transfer ) / 1000 );

		mockApi( { purchases: [], transfer, meta: { [ DISMISS_KEY ]: revertedAtSeconds + 3600 } } );
		const { result, waitForSettled } = renderNotice();
		await waitForSettled( TRANSFER_KEY );
		await waitForSettled( CURRENT_USER_KEY );
		expect( result.current ).toBeNull();
	} );

	test( 'a dismissal stamp from before the revert does not count', async () => {
		const transfer = revertedTransfer( 10 );
		const revertedAtSeconds = Math.floor( revertedAtMs( transfer ) / 1000 );

		mockApi( { purchases: [], transfer, meta: { [ DISMISS_KEY ]: revertedAtSeconds - 3600 } } );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current ).toMatchObject( { kind: 'reverted' } ) );
	} );

	test.each( [
		[ 'grace on a Simple site', { purchases: [ grace() ] } ],
		[ 'post-grace', { purchases: [], transfer: revertedTransfer( 10 ) } ],
	] )( 'in %s a failed meta fetch hides the notice', async ( _, api ) => {
		mockApi( api );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wp/v2/sites/${ SITE_ID }/users/me` )
			.query( true )
			.reply( 500, { message: 'nope' } );
		const { result, queryClient, waitForSettled } = renderNotice();
		await waitForSettled( CURRENT_USER_KEY );
		expect( queryClient.getQueryState( CURRENT_USER_KEY )?.status ).toBe( 'error' );
		expect( result.current ).toBeNull();
	} );

	test( 'with no dismiss key on the site the state is still shown, without a key', async () => {
		mockApi( { purchases: [], transfer: revertedTransfer( 10 ), meta: { unrelated: 1 } } );
		const { result } = renderNotice();
		await waitFor( () => expect( result.current ).toMatchObject( { kind: 'reverted' } ) );
		expect( ( result.current as { dismissMetaKey?: string } ).dismissMetaKey ).toBeUndefined();
	} );
} );
