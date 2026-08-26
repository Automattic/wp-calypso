/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { AuthContext } from '../../auth';
import UnknownError from '../index';
import type { User } from '@automattic/api-core';

const RAW_API_MESSAGE =
	'An active access token must be used to query information about the current user.';

function wpError( fields: Record< string, unknown >, message = RAW_API_MESSAGE ) {
	return Object.assign( new Error( message ), {
		name: 'AuthorizationRequiredError',
		status: 403,
		statusCode: 403,
		...fields,
	} );
}

/** No credential was accepted, so signing in again is the fix. */
function noIdentityError() {
	return wpError( { error: 'authorization_required', reason: 'no_identity' } );
}

/** Authenticated, but not allowed to see this. Signing in again changes nothing. */
function forbiddenError() {
	return wpError(
		{ error: 'authorization_required' },
		'User or Token does not have access to specified site.'
	);
}

function renderWithLogout( error: Error, logout: () => Promise< void > ) {
	const user = { ID: 1, username: 'testuser', language: 'en' } as User;
	return render(
		<AuthContext.Provider value={ { user, logout } }>
			<UnknownError error={ error } />
		</AuthContext.Provider>
	);
}

describe( 'UnknownError', () => {
	describe( 'when re-authentication is required', () => {
		const originalLocation = window.location;

		beforeEach( () => {
			Object.defineProperty( window, 'location', {
				writable: true,
				value: { href: '', origin: 'http://localhost', pathname: '/sites' },
			} );
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', { writable: true, value: originalLocation } );
		} );

		it( 'sends the user to re-authenticate instead of rendering', () => {
			const { container } = render(
				<UnknownError error={ wpError( { error: 'reauthorization_required' } ) } />
			);

			expect( window.location.href ).toContain( '/me/reauth-required' );
			expect( container ).not.toHaveTextContent( /problem with your session/i );
		} );
	} );

	describe( 'when the request carried no usable credential', () => {
		it( 'explains the problem instead of showing the raw API message', async () => {
			renderWithLogout( noIdentityError(), jest.fn() );

			expect(
				await screen.findByText( /trouble accessing data from your account/i )
			).toBeVisible();
			expect( screen.queryByText( RAW_API_MESSAGE ) ).not.toBeInTheDocument();
		} );

		it( 'offers a way to log out and back in', async () => {
			const logout = jest.fn();
			renderWithLogout( noIdentityError(), logout );

			await userEvent.click( await screen.findByRole( 'button', { name: /log out/i } ) );

			expect( logout ).toHaveBeenCalled();
		} );

		it( 'links to support', async () => {
			renderWithLogout( noIdentityError(), jest.fn() );

			expect( await screen.findByRole( 'link', { name: /support/i } ) ).toBeVisible();
		} );
	} );

	describe( 'when the account simply lacks access', () => {
		it( 'does not tell the user to log in again', async () => {
			renderWithLogout( forbiddenError(), jest.fn() );

			expect(
				await screen.findByText( 'User or Token does not have access to specified site.' )
			).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /log out/i } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'for any other failure', () => {
		it( 'keeps showing the underlying message', async () => {
			render( <UnknownError error={ new Error( 'Something specific broke' ) } /> );

			expect( await screen.findByText( 'Something specific broke' ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /log out/i } ) ).not.toBeInTheDocument();
		} );
	} );
} );
