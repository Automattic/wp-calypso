/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { AuthProvider } from '../index';

const API = 'https://public-api.wordpress.com';
const SITE_ID = 12345;

function interceptSession( status: number ) {
	return nock( API )
		.get( '/rest/v1.1/me' )
		.query( true )
		.reply(
			status,
			status === 200
				? { ID: 1, username: 'testuser', language: 'en' }
				: { error: 'authorization_required', message: 'An active access token must be used.' }
		);
}

/**
 * Stands in for any screen reading a resource the user cannot access — e.g. the
 * cancel flow reading `/sites/{blog_id}/features` for a siteless purchase.
 */
function ForbiddenResourceConsumer() {
	const { isError } = useQuery( {
		queryKey: [ 'site', SITE_ID, 'features' ],
		queryFn: () => Promise.reject( makeWpError() ),
		retry: false,
	} );
	return <div>{ isError ? 'resource forbidden' : 'loading' }</div>;
}

function makeWpError() {
	const err = new Error( 'authorization_required' ) as Error & Record< string, unknown >;
	err.status = 403;
	err.statusCode = 403;
	err.error = 'authorization_required';
	return err;
}

function renderWithAuth( ui: React.ReactElement ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return render(
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>{ ui }</AuthProvider>
		</QueryClientProvider>
	);
}

describe( 'AuthProvider', () => {
	let navigations: string[];

	beforeEach( () => {
		navigations = [];
		delete ( window as unknown as { location?: unknown } ).location;
		( window as unknown as { location: unknown } ).location = {
			pathname: '/me/billing/purchases/999/cancel',
			search: '',
			origin: 'https://wordpress.com',
			replace: ( url: string ) => navigations.push( url ),
			get href() {
				return 'https://wordpress.com/me/billing/purchases/999/cancel';
			},
			set href( url: string ) {
				navigations.push( url );
			},
		};
	} );

	test( 'does not sign the user out when a forbidden resource 403s but the session is valid', async () => {
		interceptSession( 200 ); // AuthProvider mount
		interceptSession( 200 ); // session re-check after the 403

		renderWithAuth( <ForbiddenResourceConsumer /> );

		expect( await screen.findByText( 'resource forbidden' ) ).toBeVisible();

		// The regression: redirecting here sends a signed-in user to /log-in, which
		// bounces back to this page and re-fires the same request. See SHILL-2295.
		await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
		expect( navigations ).toEqual( [] );
	} );

	test( 'signs the user out when a 403 really does mean the session is gone', async () => {
		interceptSession( 200 ); // AuthProvider mount
		interceptSession( 403 ); // session re-check confirms the session expired

		renderWithAuth( <ForbiddenResourceConsumer /> );

		await waitFor( () => expect( navigations ).toHaveLength( 1 ) );
		expect( navigations[ 0 ] ).toContain( 'log-in' );
	} );

	test( 'signs the user out when the session request itself fails', async () => {
		interceptSession( 403 );

		renderWithAuth( <div>never rendered</div> );

		await waitFor( () => expect( navigations.length ).toBeGreaterThan( 0 ) );
		expect( navigations[ 0 ] ).toContain( 'log-in' );
	} );
} );
