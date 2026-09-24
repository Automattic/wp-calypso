/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import SecuritySocialLogins from '..';
import { AuthProvider } from '../../../app/auth';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import type { User } from '@automattic/api-core';

const userWithoutApple = {
	ID: 1,
	username: 'testuser',
	language: 'en',
	social_login_connections: [],
} as unknown as User;

const userWithApple = {
	...userWithoutApple,
	social_login_connections: [ { service: 'apple', service_user_email: 'person@example.com' } ],
} as unknown as User;

// The page reads the user from the real auth query (rather than the static user
// test-utils provides) so we can check it picks up changes after a mutation.
function renderWithBootstrappedUser( user: User ) {
	window.currentUser = user;
	return render(
		<AuthProvider>
			<SecuritySocialLogins />
			<Snackbars />
		</AuthProvider>,
		{ queryClient }
	);
}

describe( '<SecuritySocialLogins>', () => {
	beforeEach( () => {
		config.enable( 'wpcom-user-bootstrap' );
		( window as unknown as { AppleID: unknown } ).AppleID = {
			auth: { init: jest.fn(), signIn: jest.fn() },
		};
	} );

	afterEach( () => {
		// Unmount first so resetting the shared state below doesn't re-render the page outside act().
		cleanup();
		config.disable( 'wpcom-user-bootstrap' );
		delete window.currentUser;
		delete ( window as unknown as { AppleID?: unknown } ).AppleID;
		window.sessionStorage.clear();
		window.history.replaceState( null, '', '/' );
		queryClient.clear();
		dispatch( noticesStore ).removeAllNotices( 'snackbar' );
	} );

	test( 'shows Apple as connected after returning from Apple sign-in', async () => {
		window.sessionStorage.setItem( 'siwa_state', '123' );
		window.history.replaceState(
			null,
			'',
			'/me/security/social-logins#client_id=com.wordpress.siwa&state=123&id_token=token'
		);
		const connect = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/social-login/connect' )
			.reply( 200, { success: true } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 200, userWithApple );

		renderWithBootstrappedUser( userWithoutApple );

		await waitFor( () => expect( connect.isDone() ).toBe( true ) );
		expect( await screen.findByText( 'person@example.com' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Disconnect' } ) ).toBeVisible();
	} );

	test( 'shows Apple as disconnected after removing it', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/social-login/disconnect' )
			.reply( 200, { success: true } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 200, userWithoutApple );

		renderWithBootstrappedUser( userWithApple );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Disconnect' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Remove social login' } ) );

		await waitFor( () =>
			expect( screen.queryByText( 'person@example.com' ) ).not.toBeInTheDocument()
		);
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
		expect( screen.queryByRole( 'button', { name: 'Disconnect' } ) ).not.toBeInTheDocument();
	} );

	test( 'confirms the disconnect even when refreshing the user fails', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/social-login/disconnect' )
			.reply( 200, { success: true } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me' )
			.query( true )
			.reply( 500, { error: 'unknown', message: 'Something went wrong' } );

		renderWithBootstrappedUser( userWithApple );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Disconnect' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Remove social login' } ) );

		// Query the rendered snackbar: `screen` would also match the text Snackbar
		// announces into the shared a11y live region, which outlives each test.
		// It's still animating in, so it isn't "visible" yet.
		const snackbar = await screen.findByRole( 'button', { name: 'Dismiss this notice' } );
		expect( within( snackbar ).getByText( 'Apple login disconnected.' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Failed to disconnect social login.' ) ).not.toBeInTheDocument();
	} );
} );
