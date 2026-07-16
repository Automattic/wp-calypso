/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { bumpStat } from '../../analytics';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { AuthProvider } from '../index';
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

describe( '<AuthProvider>', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { href: 'https://example.com/sites', pathname: '/sites', search: '' },
		} );
	} );

	afterEach( () => {
		config.disable( 'wpcom-user-bootstrap' );
		delete window.currentUser;
	} );

	test( 'bumps a success stat when the bootstrapped user is available', async () => {
		config.enable( 'wpcom-user-bootstrap' );
		window.currentUser = testUser;

		renderAuth();

		expect( await screen.findByText( 'signed in' ) ).toBeVisible();
		expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-auth', 'success:bootstrap' );
	} );

	test( 'bumps a bounce stat and redirects to login when the bootstrapped user is missing', async () => {
		config.enable( 'wpcom-user-bootstrap' );

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-auth', 'bounce:bootstrap' )
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
		expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-auth', 'success:fetch' );
	} );

	test( 'bumps a bounce stat and redirects to login when fetching the user is unauthorized', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 403, { error: 'authorization_required', message: 'User cannot access this' } );

		renderAuth();

		await waitFor( () =>
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-auth', 'bounce:unauthorized' )
		);
		expect( window.location.href ).toContain( '/log-in?redirect_to=' );
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
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-auth', 'bounce:expired' )
		);
	} );
} );
