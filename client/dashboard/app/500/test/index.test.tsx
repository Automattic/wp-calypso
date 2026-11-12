/**
 * @jest-environment jsdom
 */
import { onlineManager } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { logToLogstash } from 'calypso/lib/logstash';
import { render } from '../../../test-utils';
import { bumpStat } from '../../analytics';
import { AuthContext } from '../../auth';
import UnknownError from '../index';
import type { User } from '@automattic/api-core';

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '../../analytics', () => ( {
	...jest.requireActual( '../../analytics' ),
	bumpStat: jest.fn(),
} ) );

const mockedBumpStat = jest.mocked( bumpStat );
const mockedLogToLogstash = jest.mocked( logToLogstash );

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

function authorizationError() {
	return wpError( { error: 'authorization_required' } );
}

/** Authenticated, but not allowed to see this — identical to the above. */
function forbiddenError() {
	return wpError(
		{ error: 'authorization_required' },
		'User or Token does not have access to specified site.'
	);
}

function mockDeadSession() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me' )
		.query( true )
		.reply( 403, { error: 'authorization_required', message: 'No active access token' } );
}

function mockWorkingSession() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me' )
		.query( true )
		.reply( 200, { ID: 1, username: 'testuser', language: 'en' } );
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

		test( 'sends the user to re-authenticate instead of rendering', () => {
			const { container } = render(
				<UnknownError error={ wpError( { error: 'reauthorization_required' } ) } />
			);

			expect( window.location.href ).toContain( '/me/reauth-required' );
			expect( container ).not.toHaveTextContent( /trouble accessing data/i );
		} );
	} );

	describe( 'when a request is refused and the session is gone', () => {
		beforeEach( mockDeadSession );

		test( 'explains the problem instead of showing the raw API message', async () => {
			renderWithLogout( authorizationError(), jest.fn() );

			expect(
				await screen.findByText( /trouble accessing data from your account/i )
			).toBeVisible();
			expect( screen.queryByText( RAW_API_MESSAGE ) ).not.toBeInTheDocument();
		} );

		test( 'offers a way to log out and back in', async () => {
			const logout = jest.fn();
			renderWithLogout( authorizationError(), logout );

			await userEvent.click( await screen.findByRole( 'button', { name: /log out/i } ) );

			expect( logout ).toHaveBeenCalled();
		} );

		test( 'links to support', async () => {
			renderWithLogout( authorizationError(), jest.fn() );

			expect( await screen.findByRole( 'link', { name: /support/i } ) ).toBeVisible();
		} );

		test( 'counts the user as stranded', async () => {
			renderWithLogout( authorizationError(), jest.fn() );

			// The screen shows this before the check resolves, so the stat is what says
			// the session was actually confirmed gone.
			await waitFor( () =>
				expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-error', 'refused:dead' )
			);
		} );
	} );

	describe( 'when the account simply lacks access', () => {
		beforeEach( mockWorkingSession );

		test( 'says so instead of blaming the session', async () => {
			renderWithLogout( forbiddenError(), jest.fn() );

			expect( await screen.findByText( /doesn’t have permission/i ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /log out/i } ) ).not.toBeInTheDocument();
		} );

		test( 'still offers support', async () => {
			renderWithLogout( forbiddenError(), jest.fn() );

			expect( await screen.findByRole( 'link', { name: /support/i } ) ).toBeVisible();
		} );

		test( 'is recorded as a permission problem, not a dead session', async () => {
			renderWithLogout( forbiddenError(), jest.fn() );

			await screen.findByText( /doesn’t have permission/i );
			expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-error', 'refused:alive' );
			expect( mockedBumpStat ).not.toHaveBeenCalledWith( 'dashboard-error', 'refused:dead' );
		} );
	} );

	describe( 'when the session cannot be checked at all', () => {
		test( 'falls back to suggesting a fresh log in', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me' )
				.query( true )
				.replyWithError( 'offline' );
			renderWithLogout( authorizationError(), jest.fn() );

			await waitFor( async () =>
				expect( await screen.findByRole( 'button', { name: /log out/i } ) ).toBeVisible()
			);
		} );

		test( 'records that the session was never established, not that it died', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me' )
				.query( true )
				.replyWithError( 'offline' );
			renderWithLogout( authorizationError(), jest.fn() );

			await waitFor( () =>
				expect( mockedBumpStat ).toHaveBeenCalledWith( 'dashboard-error', 'refused:unknown' )
			);
			expect( mockedBumpStat ).not.toHaveBeenCalledWith( 'dashboard-error', 'refused:dead' );
		} );
	} );

	describe( 'when the check has not answered yet', () => {
		test( 'shows something to act on rather than a blank screen', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me' )
				.query( true )
				.delay( 30000 )
				.reply( 200, { ID: 1, username: 'testuser', language: 'en' } );

			const { container } = renderWithLogout( authorizationError(), jest.fn() );

			expect( await screen.findByRole( 'button', { name: /log out/i } ) ).toBeVisible();
			expect( container ).not.toBeEmptyDOMElement();
		} );
	} );

	describe( 'when the browser is offline', () => {
		beforeEach( () => onlineManager.setOnline( false ) );
		afterEach( () => onlineManager.setOnline( true ) );

		test( 'still gives the user something to act on rather than a blank screen', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me' )
				.query( true )
				.replyWithError( 'offline' );

			const { container } = renderWithLogout( authorizationError(), jest.fn() );

			expect( await screen.findByRole( 'button', { name: /log out/i } ) ).toBeVisible();
			expect( container ).not.toBeEmptyDOMElement();
		} );

		test( 'still asks the API rather than waiting for the browser to come back', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.1/me' )
				.query( true )
				.replyWithError( 'offline' );

			renderWithLogout( authorizationError(), jest.fn() );

			await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		} );
	} );

	describe( 'auditing why the request was refused', () => {
		/** Carries the endpoint's own explanation alongside the code. */
		function unauthenticatedError() {
			return wpError( { error: 'authorization_required', reason: 'unauthenticated' } );
		}

		test( 'records the endpoint reason next to what the session check found', async () => {
			mockDeadSession();
			renderWithLogout( unauthenticatedError(), jest.fn() );

			await waitFor( () => expect( mockedLogToLogstash ).toHaveBeenCalled() );
			expect( mockedLogToLogstash.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
				feature: 'calypso_client',
				extra: {
					type: 'dashboard_refused_request',
					session_state: 'dead',
					reason: 'unauthenticated',
					code: 'authorization_required',
					status: 403,
				},
			} );
		} );

		test( 'records the disagreement when the session is actually fine', async () => {
			mockWorkingSession();
			renderWithLogout( unauthenticatedError(), jest.fn() );

			await waitFor( () => expect( mockedLogToLogstash ).toHaveBeenCalled() );
			expect( mockedLogToLogstash.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
				extra: { session_state: 'alive', reason: 'unauthenticated' },
			} );
		} );

		test( 'reads the reason out of the WP REST envelope too', async () => {
			mockDeadSession();
			renderWithLogout(
				wpError( { code: 'rest_forbidden', data: { status: 403, reason: 'unauthenticated' } } ),
				jest.fn()
			);

			await waitFor( () => expect( mockedLogToLogstash ).toHaveBeenCalled() );
			expect( mockedLogToLogstash.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
				extra: { code: 'rest_forbidden', reason: 'unauthenticated' },
			} );
		} );

		test( 'does not log for errors that are not refusals', async () => {
			render( <UnknownError error={ new Error( 'Something specific broke' ) } /> );

			await screen.findByText( 'Something specific broke' );
			expect( mockedLogToLogstash ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'for any other failure', () => {
		test( 'keeps showing the underlying message', async () => {
			render( <UnknownError error={ new Error( 'Something specific broke' ) } /> );

			expect( await screen.findByText( 'Something specific broke' ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: /log out/i } ) ).not.toBeInTheDocument();
		} );

		test( 'still offers support, since the message alone is no help', async () => {
			render( <UnknownError error={ new Error( 'Something specific broke' ) } /> );

			expect( await screen.findByRole( 'link', { name: /support/i } ) ).toBeVisible();
		} );

		test( 'is not counted as a dead session either', async () => {
			render( <UnknownError error={ new Error( 'Something specific broke' ) } /> );

			await screen.findByText( 'Something specific broke' );
			expect( mockedBumpStat ).not.toHaveBeenCalled();
		} );
	} );
} );
