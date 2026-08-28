/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { bumpStat } from '../../analytics';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { AuthProvider, sessionStateQuery, useSessionStateQuery } from '../index';
import type { User } from '@automattic/api-core';

jest.mock( '../../analytics', () => ( {
	...jest.requireActual( '../../analytics' ),
	bumpStat: jest.fn(),
} ) );

const mockedBumpStat = jest.mocked( bumpStat );

const testUser = { ID: 1, username: 'testuser', language: 'en' } as User;

function wpError( fields: { status: number; statusCode: number; error?: string } ) {
	return Object.assign( new Error( 'boom' ), fields );
}

function renderAuth() {
	const queryClient = new QueryClient();
	return {
		queryClient,
		...render(
			<QueryClientProvider client={ queryClient }>
				<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
					<AuthProvider>
						<div>signed in</div>
					</AuthProvider>
				</AppProvider>
			</QueryClientProvider>
		),
	};
}

describe( '<AuthProvider> stats', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { href: 'https://example.com/sites', pathname: '/sites', search: '' },
		} );
	} );

	afterEach( () => {
		config.disable( 'wpcom-user-bootstrap' );
		delete window.currentUser;
		window.sessionStorage.clear();
	} );

	test( 'bumps a success stat when the bootstrapped user is available', async () => {
		config.enable( 'wpcom-user-bootstrap' );
		window.currentUser = testUser;

		renderAuth();

		expect( await screen.findByText( 'signed in' ) ).toBeVisible();
		expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'success:bootstrap' );
	} );

	test( 'bumps a bounce stat and redirects to login when the bootstrapped user is missing', async () => {
		config.enable( 'wpcom-user-bootstrap' );

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'bounce:bootstrap' )
		);
		expect( window.location.href ).toContain( '/log-in?redirect_to=' );
		expect( screen.queryByText( 'signed in' ) ).not.toBeInTheDocument();
	} );

	test( 'bumps a success stat when the user is fetched from the API', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 200, testUser );

		renderAuth();

		expect( await screen.findByText( 'signed in' ) ).toBeVisible();
		expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'success:fetch' );
	} );

	test( 'bumps a bounce stat and redirects to login when fetching the user is unauthorized', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 403, { error: 'authorization_required', message: 'User cannot access this' } );

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'bounce:unauthorized' )
		);
		expect( window.location.href ).toContain( '/log-in?redirect_to=' );
	} );

	test( 'does not bump a loop stat on the first bounce', async () => {
		config.enable( 'wpcom-user-bootstrap' );

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'bounce:bootstrap' )
		);
		expect( mockedBumpStat ).not.toHaveBeenCalledWith( 'dashboard-auth-loop', expect.anything() );
	} );

	test( 'bumps a loop stat with the bounce count when a bounce repeats within the loop window', async () => {
		config.enable( 'wpcom-user-bootstrap' );
		window.sessionStorage.setItem(
			'wpcom_auth_bounce_count',
			JSON.stringify( { count: 1, at: Date.now() } )
		);

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth-loop', '2' )
		);
	} );

	test( 'caps the loop stat count', async () => {
		config.enable( 'wpcom-user-bootstrap' );
		window.sessionStorage.setItem(
			'wpcom_auth_bounce_count',
			JSON.stringify( { count: 20, at: Date.now() } )
		);

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth-loop', '10+' )
		);
	} );

	test( 'does not bump a loop stat when the previous bounce is outside the loop window', async () => {
		config.enable( 'wpcom-user-bootstrap' );
		window.sessionStorage.setItem(
			'wpcom_auth_bounce_count',
			JSON.stringify( { count: 5, at: Date.now() - 60 * 1000 } )
		);

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'bounce:bootstrap' )
		);
		expect( mockedBumpStat ).not.toHaveBeenCalledWith( 'dashboard-auth-loop', expect.anything() );
	} );

	test( 'bumps a bounce stat when the session expires mid-app', async () => {
		config.enable( 'wpcom-user-bootstrap' );
		window.currentUser = testUser;

		const { queryClient } = renderAuth();
		expect( await screen.findByText( 'signed in' ) ).toBeVisible();

		const error = wpError( { status: 401, statusCode: 401, error: 'authorization_required' } );
		await expect(
			queryClient.fetchQuery( {
				queryKey: [ 'some-data' ],
				queryFn: () => Promise.reject( error ),
				retry: false,
			} )
		).rejects.toBe( error );

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-auth', 'bounce:expired' )
		);
	} );
} );

describe( 'useSessionStateQuery', () => {
	function renderSessionState( queryClient = new QueryClient() ) {
		return renderHook( () => useSessionStateQuery(), {
			wrapper: ( { children } ) => (
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			),
		} );
	}

	test( 'reports a session that can no longer authenticate as dead', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 403, { error: 'authorization_required', message: 'User cannot access this' } );

		const { result } = renderSessionState();

		await waitFor( () => expect( result.current.data ).toBe( 'dead' ) );
	} );

	test( 'reports an account that merely lacks a permission as alive', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 200, testUser );

		const { result } = renderSessionState();

		await waitFor( () => expect( result.current.data ).toBe( 'alive' ) );
	} );

	test( 'separates a probe that never answered from a dead session', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.replyWithError( 'offline' );

		const { result } = renderSessionState();

		await waitFor( () => expect( result.current.data ).toBe( 'unknown' ) );
	} );

	test( 'reuses an answer already in the cache', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 200, testUser );
		// Queued for a refetch to consume. Serving stale data while revalidating would
		// still read as 'alive' at first, so flipping the answer is what makes an
		// extra request visible.
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 403, { error: 'authorization_required', message: 'User cannot access this' } );

		const queryClient = new QueryClient();
		await queryClient.fetchQuery( sessionStateQuery() );

		const { result } = renderSessionState( queryClient );

		await waitFor( () => expect( result.current.data ).toBe( 'alive' ) );
		await expect(
			waitFor( () => expect( nock.isDone() ).toBe( true ), { timeout: 250 } )
		).rejects.toThrow();
		expect( result.current.data ).toBe( 'alive' );
	} );
} );
