/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
// eslint-disable-next-line no-restricted-imports
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import currentUserReducer from 'calypso/state/current-user/reducer';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import EmailVerificationGate from '..';
import { renderStep } from '../../../test/helpers';
import { beginGate, isGatePending } from '../storage';

jest.mock( 'calypso/lib/analytics/tracks' );

// Stub the poll action so the polling behaviour can be driven deterministically,
// without the module-level in-flight guard in the real `fetchCurrentUser`.
jest.mock( 'calypso/state/current-user/actions', () => ( {
	__esModule: true,
	...jest.requireActual( 'calypso/state/current-user/actions' ),
	fetchCurrentUser: jest.fn( () => ( { type: 'TEST_NOOP' } ) ),
} ) );

const EMAIL = 'onboarder@example.com';
const USER_ID = 1;
const COOLDOWN_MS = 60 * 1000;
const FLOW = 'onboarding';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const mockSendVerificationEmail = ( response: { success: boolean } = { success: true } ) =>
	mockApi().post( '/rest/v1.1/me/send-verification-email' ).reply( 200, response );

// The shape the server returns when it refuses a resend: `throttled`/429 with the wait in
// seconds under `data.retry_after`.
const mockSendVerificationEmailThrottled = ( retryAfter: number ) =>
	mockApi()
		.post( '/rest/v1.1/me/send-verification-email' )
		.reply( 429, {
			error: 'throttled',
			message: 'You have requested too many verification emails.',
			data: { retry_after: retryAfter },
		} );

const mockFetchUser = ( emailVerified: boolean ) =>
	mockApi()
		.get( '/rest/v1.1/me' )
		.query( true )
		.reply( 200, { ID: USER_ID, email: EMAIL, email_verified: emailVerified } );

const mockFetchUserError = () =>
	mockApi().get( '/rest/v1.1/me' ).query( true ).reply( 500, { error: 'server_error' } );

const currentUserState = ( emailVerified: boolean ) => ( {
	currentUser: {
		id: USER_ID,
		user: { ID: USER_ID, email: EMAIL, email_verified: emailVerified },
	},
} );

const SCOPE = `${ FLOW }:${ USER_ID }`;

const render = ( { onDone = jest.fn(), logo }: { onDone?: jest.Mock; logo?: ReactNode } = {} ) => {
	// The account step opens the gate on account creation, seeding the send/shown
	// timestamps; simulate that once. A remount (refresh) must not rewrite them.
	if ( ! isGatePending( SCOPE ) ) {
		beginGate( SCOPE );
	}
	const result = renderStep(
		<EmailVerificationGate flow={ FLOW } scope={ SCOPE } logo={ logo } onDone={ onDone } />,
		{
			initialState: currentUserState( false ),
		}
	);
	return { ...result, onDone };
};

describe( 'EmailVerificationGate', () => {
	beforeAll( () => nock.disableNetConnect() );

	afterEach( () => {
		jest.clearAllMocks();
		jest.useRealTimers();
		nock.cleanAll();
		sessionStorage.clear();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'shows the seeded cooldown on mount without sending or recording a send', async () => {
		const request = mockSendVerificationEmail();

		render();

		expect( screen.getByRole( 'heading', { name: 'Verify your email' } ) ).toBeVisible();
		expect( screen.getByText( EMAIL ) ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend (1:00)' } ) ).toBeVisible()
		);

		expect( request.isDone() ).toBe( false );
		// The initial send is recorded by the account step, not the gate.
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			expect.anything()
		);
	} );

	it( 'offers an inbox button that deep-links to a known provider', async () => {
		renderStep( <EmailVerificationGate flow={ FLOW } scope={ SCOPE } onDone={ jest.fn() } />, {
			initialState: {
				currentUser: {
					id: USER_ID,
					user: { ID: USER_ID, email: 'onboarder@gmail.com', email_verified: false },
				},
			},
		} );

		const openButton = await screen.findByRole( 'link', { name: 'Open email inbox' } );
		expect( openButton.getAttribute( 'href' ) ).toContain( 'mail.google.com' );
		// For a known provider the inbox link is the only confirmation action; the manual
		// re-check is the fallback for providers without one.
		expect(
			screen.queryByRole( 'button', { name: /confirmed my email/ } )
		).not.toBeInTheDocument();

		await userEvent.click( openButton );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_open_inbox',
			expect.objectContaining( { flow: FLOW, provider: 'gmail' } )
		);
	} );

	it( 'falls back to a manual re-check for an unrecognized provider', () => {
		render();

		// `onboarder@example.com` has no known inbox link.
		expect( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /^Open / } ) ).not.toBeInTheDocument();
	} );

	it( 'finishes as soon as the confirmation lands in another tab', async () => {
		const onDone = jest.fn();
		// Only the slices this gate touches: its own user state, plus the two
		// `DocumentHead` reads.
		const store = createStore(
			combineReducers( {
				currentUser: currentUserReducer,
				documentHead: documentHeadReducer,
				ui: uiReducer,
			} ),
			currentUserState( false ),
			applyMiddleware( thunkMiddleware )
		);

		renderWithProvider(
			<MemoryRouter>
				<EmailVerificationGate flow={ FLOW } scope={ SCOPE } onDone={ onDone } />
			</MemoryRouter>,
			{ store }
		);

		expect( onDone ).not.toHaveBeenCalled();

		// `UserVerificationChecker` refetches the user when the confirmation
		// landing page signals it from the other tab; this is what lands in the store.
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: USER_ID, email: EMAIL, email_verified: true },
			} );
		} );

		await waitFor( () => expect( onDone ).toHaveBeenCalled() );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: FLOW } )
		);
	} );

	it( 'finishes when the manual check finds the email confirmed', async () => {
		mockFetchUser( true );
		const { onDone } = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		await waitFor( () => expect( onDone ).toHaveBeenCalled() );
	} );

	it( 'distinguishes a failed check request from an unconfirmed email', async () => {
		mockFetchUserError();
		const { onDone } = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		expect( await screen.findByText( /We couldn’t check right now\./ ) ).toBeVisible();
		expect(
			screen.queryByText( /We haven’t received your confirmation yet\./ )
		).not.toBeInTheDocument();
		expect( onDone ).not.toHaveBeenCalled();
	} );

	it( 'holds the button for as long as the server says when it throttles', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		// Past the per-minute interval, so the server is reporting the hourly lockout.
		mockSendVerificationEmailThrottled( 25 * 60 );

		render();

		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );
		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		// Held for the server's wait rather than the opening hold.
		expect( await screen.findByRole( 'button', { name: 'Resend (25:00)' } ) ).toBeVisible();
		expect( screen.getByText( /Look for one we/ ) ).toBeVisible();
		// A refusal is not a failure, so the generic send error stays away.
		expect( screen.queryByText( /We couldn’t send the email/ ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_send_failed',
			expect.objectContaining( { flow: FLOW, is_resend: true, error: 'throttled' } )
		);

		// The refusal expires with the wait it described — a notice explaining a locked button
		// must not outlive the lock.
		act( () => {
			jest.advanceTimersByTime( 25 * 60 * 1000 );
		} );
		expect( await screen.findByRole( 'button', { name: 'Resend' } ) ).toBeEnabled();
		expect( screen.queryByText( /Look for one we/ ) ).not.toBeInTheDocument();
	} );

	it( 'resends once the cooldown lapses and restarts it', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const request = mockSendVerificationEmail();

		render();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend (1:00)' } ) ).toBeVisible()
		);
		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );

		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		// Held for the server's interval between sends, not the shorter opening hold.
		expect( await screen.findByRole( 'button', { name: 'Resend (5:00)' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			expect.objectContaining( { flow: FLOW, is_resend: true } )
		);
	} );
} );
