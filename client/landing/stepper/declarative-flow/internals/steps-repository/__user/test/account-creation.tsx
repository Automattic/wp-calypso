/**
 * @jest-environment jsdom
 */

jest.mock( 'wpcom-proxy-request', () => ( {
	...jest.requireActual( 'wpcom-proxy-request' ),
	reloadProxy: jest.fn(),
	requestAllBlogsAccess: jest.fn(),
} ) );

jest.mock( 'calypso/lib/user/shared-utils', () => ( {
	...jest.requireActual( 'calypso/lib/user/shared-utils' ),
	rawCurrentUserFetch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	usePartnerBranding: () => ( { hasCustomBranding: false, partnerConfig: null } ),
} ) );

// A thunk, so it only records when dispatched.
const mockSendTracksEvent = jest.fn();
jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEventWithClientId: ( name: string ) => () => mockSendTracksEvent( name ),
} ) );

// Stands in for the form's `goToNextStep` call after `/users/new` succeeds.
jest.mock( 'calypso/blocks/signup-form/signup-form-social-first', () => ( {
	__esModule: true,
	default: ( {
		goToNextStep,
	}: {
		goToNextStep: ( data: { bearer_token: string; username: string } ) => void;
	} ) => (
		<button onClick={ () => goToNextStep( { bearer_token: 'token', username: 'newuser' } ) }>
			Create account
		</button>
	),
} ) );

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { reloadProxy } from 'wpcom-proxy-request';
import { rawCurrentUserFetch } from 'calypso/lib/user/shared-utils';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';

const mockReloadProxy = reloadProxy as jest.Mock;
const mockRawCurrentUserFetch = rawCurrentUserFetch as jest.Mock;

const NEW_USER = { ID: 1, username: 'newuser', email: 'newuser@example.com' };
const LOGGED_OUT = new Error( 'Not logged in' );

describe( 'User step account creation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const renderUserStep = () => {
		const navigation = { submit: jest.fn() };
		const { unmount } = renderWithProvider(
			<MemoryRouter initialEntries={ [ '/onboarding/user' ] }>
				<UserStep flow="onboarding" stepName="user" navigation={ navigation } />
			</MemoryRouter>
		);
		return { navigation, unmount };
	};

	it( 'reloads the proxy once for the new account and submits once its user loads', async () => {
		mockRawCurrentUserFetch.mockRejectedValueOnce( LOGGED_OUT ).mockResolvedValue( NEW_USER );
		const { navigation } = renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );

		await waitFor( () => expect( navigation.submit ).toHaveBeenCalled() );
		expect( mockReloadProxy ).toHaveBeenCalledTimes( 1 );
		expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'fetches the new user again when the reload fails a `/me` sent before it', async () => {
		let failPendingFetch: ( error: Error ) => void = () => {};
		mockRawCurrentUserFetch
			.mockReturnValueOnce(
				new Promise( ( resolve, reject ) => {
					failPendingFetch = reject;
				} )
			)
			.mockResolvedValue( NEW_USER );
		// The proxy fails what was in flight on the iframe it replaces.
		mockReloadProxy.mockImplementation( () => failPendingFetch( LOGGED_OUT ) );
		const { navigation } = renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );

		await waitFor( () => expect( navigation.submit ).toHaveBeenCalled() );
		expect( mockRawCurrentUserFetch ).toHaveBeenLastCalledWith( { retry: true } );
	} );

	it( 'replaces the form with a login offer when neither `/me` fetch finds the new user', async () => {
		mockRawCurrentUserFetch.mockRejectedValue( LOGGED_OUT );
		const { navigation } = renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );
		expect( screen.queryByRole( 'link', { name: 'Log in now' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );

		const loginLink = await screen.findByRole( 'link', { name: 'Log in now' } );
		expect( loginLink ).toBeVisible();
		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Log in now to finish signing up.' );
		expect( loginLink ).toHaveAttribute( 'href', expect.stringContaining( '/log-in' ) );
		expect( screen.queryByRole( 'button', { name: 'Create account' } ) ).not.toBeInTheDocument();
		expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 3 );
		expect( navigation.submit ).not.toHaveBeenCalled();

		await userEvent.click( loginLink );

		expect( mockSendTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_login_midflow' );
	} );

	it( 'ignores the `/me` fetches of an earlier account-create response', async () => {
		// After the boot fetch, every `/me` stays pending until the test fails it.
		const failFetch: Array< ( error: Error ) => void > = [];
		mockRawCurrentUserFetch
			.mockRejectedValueOnce( LOGGED_OUT )
			.mockImplementation( () => new Promise( ( _resolve, reject ) => failFetch.push( reject ) ) );
		renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );

		// The first response's first fetch fails, so it starts its second one.
		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 2 ) );
		await act( async () => failFetch[ 0 ]( LOGGED_OUT ) );
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 3 ) );

		// A newer response shares that in-flight fetch; when it fails, only the newer response's
		// chain may act on it, by fetching once more.
		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );
		await act( async () => failFetch[ 1 ]( LOGGED_OUT ) );
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 4 ) );

		expect( screen.queryByRole( 'link', { name: 'Log in now' } ) ).not.toBeInTheDocument();

		// `fetchCurrentUser` hands its in-flight fetch to later tests too, so settle it.
		await act( async () => failFetch[ 2 ]( LOGGED_OUT ) );
	} );

	it( 'stops fetching the new user once the step unmounts', async () => {
		const failFetch: Array< ( error: Error ) => void > = [];
		mockRawCurrentUserFetch
			.mockRejectedValueOnce( LOGGED_OUT )
			.mockImplementation( () => new Promise( ( _resolve, reject ) => failFetch.push( reject ) ) );
		const { unmount } = renderUserStep();
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 1 ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Create account' } ) );
		await waitFor( () => expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 2 ) );

		unmount();
		await act( async () => failFetch[ 0 ]( LOGGED_OUT ) );

		expect( mockRawCurrentUserFetch ).toHaveBeenCalledTimes( 2 );
	} );
} );
