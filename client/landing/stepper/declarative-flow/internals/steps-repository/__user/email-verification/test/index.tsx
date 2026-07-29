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
import { fetchCurrentUser, setUserEmailVerified } from 'calypso/state/current-user/actions';
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
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);

		expect( request.isDone() ).toBe( false );
		// The initial send is recorded by the account step, not the gate.
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			expect.anything()
		);
	} );

	it( 'keeps the account step’s branding logo in the top bar', () => {
		render( { logo: <span data-testid="brand-logo">Woo</span> } );

		expect( screen.getByTestId( 'brand-logo' ) ).toBeVisible();
	} );

	it( 'moves focus onto the gate on mount so the screen change is announced', () => {
		render();

		// The gate replaces the account form in place; focus should land on its heading
		// region rather than being stranded on the now-unmounted submit button.
		const heading = screen.getByRole( 'heading', { name: 'Verify your email' } );
		expect( heading.closest( '.onboarding-email-verification__heading' ) ).toHaveFocus();
	} );

	it( 'offers a sniper-link inbox button for a known email provider', async () => {
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
		// The inbox CTA replaces the manual re-check for known providers.
		expect(
			screen.queryByRole( 'button', { name: 'I’ve confirmed my email' } )
		).not.toBeInTheDocument();

		await userEvent.click( openButton );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_open_inbox',
			expect.objectContaining( { flow: FLOW, provider: 'Gmail' } )
		);
	} );

	it( 'falls back to a manual re-check for an unrecognized provider', () => {
		render();

		// `onboarder@example.com` has no known inbox link.
		expect( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /^Open / } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps resend available after refreshing once the cooldown has expired', async () => {
		jest.useFakeTimers();

		const { unmount } = render();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);

		// The whole cooldown elapses, then the user refreshes (remount).
		act( () => {
			jest.advanceTimersByTime( 61 * 1000 );
		} );
		unmount();

		const secondSend = mockSendVerificationEmail();
		render();

		// Resend is available immediately — no fresh 60-second wait, and no new email.
		expect( await screen.findByRole( 'button', { name: 'Resend' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Resend in \d+s/ } ) ).not.toBeInTheDocument();
		expect( secondSend.isDone() ).toBe( false );
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

	it( 'measures duration from when the gate is shown, not from account creation', async () => {
		jest.useFakeTimers();
		beginGate( SCOPE );

		// Loading the token and hydrating the user takes time before the gate can render.
		act( () => {
			jest.advanceTimersByTime( 10_000 );
		} );

		const onDone = jest.fn();
		// Already verified, so the gate confirms immediately on mount.
		renderStep( <EmailVerificationGate flow={ FLOW } scope={ SCOPE } onDone={ onDone } />, {
			initialState: currentUserState( true ),
		} );

		await waitFor( () => expect( onDone ).toHaveBeenCalled() );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { seconds_on_step: 0 } )
		);
	} );

	it( 'finishes when the manual check finds the email confirmed', async () => {
		mockFetchUser( true );
		const { onDone } = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		await waitFor( () => expect( onDone ).toHaveBeenCalled() );
	} );

	it( 'tells the user when the manual check still shows the email unconfirmed', async () => {
		mockFetchUser( false );
		const { onDone } = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		expect(
			await screen.findByText( /We haven’t received your confirmation yet\./ )
		).toBeVisible();
		expect( onDone ).not.toHaveBeenCalled();
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

	it( 'clears a stale check notice when the email is resent', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		render();

		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );

		// A manual check comes back still unconfirmed.
		mockFetchUser( false );
		await user.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );
		expect(
			await screen.findByText( /We haven’t received your confirmation yet\./ )
		).toBeVisible();

		// Resending supersedes that check, so its notice clears alongside the fresh cooldown.
		mockSendVerificationEmail();
		await user.click( screen.getByRole( 'button', { name: 'Resend' } ) );
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);

		expect(
			screen.queryByText( /We haven’t received your confirmation yet\./ )
		).not.toBeInTheDocument();
	} );

	it( 'surfaces an unsuccessful resend and keeps resend available', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

		render();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);
		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );

		mockSendVerificationEmail( { success: false } );
		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		expect( await screen.findByText( /We couldn’t send the email\./ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Resend' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_send_failed',
			expect.objectContaining( { flow: FLOW, is_resend: true } )
		);
	} );

	it( 'holds off on resending until the seeded cooldown expires', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

		render();

		// The seeded cooldown (from the signup email) means there is nothing to click yet.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);
		expect( screen.queryByRole( 'button', { name: 'Resend' } ) ).not.toBeInTheDocument();

		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );

		const resendRequest = mockSendVerificationEmail();
		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		// A successful resend restarts the 60s cooldown; waiting for that UI change also
		// lets the send's promise chain settle before asserting on its side effects.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);

		expect( resendRequest.isDone() ).toBe( true );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			{ flow: FLOW, is_resend: true }
		);
	} );

	it( 'keeps the resend cooldown when session storage is unavailable', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const setItem = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'storage disabled' );
		} );

		try {
			render();

			// The initial cooldown holds even though nothing could be persisted.
			await waitFor( () =>
				expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
			);
			expect( screen.queryByRole( 'button', { name: 'Resend' } ) ).not.toBeInTheDocument();

			act( () => {
				jest.advanceTimersByTime( COOLDOWN_MS );
			} );

			const resendRequest = mockSendVerificationEmail();
			await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );
			await waitFor( () =>
				expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
			);

			// …and the fresh cooldown counts down instead of snapping back to zero.
			act( () => {
				jest.advanceTimersByTime( 1000 );
			} );
			expect( screen.getByRole( 'button', { name: 'Resend in 59s' } ) ).toBeVisible();
			expect( resendRequest.isDone() ).toBe( true );
		} finally {
			setItem.mockRestore();
		}
	} );

	it( 'keeps the cooldown when the gate is revisited within the window, without resending', async () => {
		jest.useFakeTimers();

		const { unmount } = render();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);

		// 20 seconds of the 60-second cooldown elapse, then the user leaves.
		act( () => {
			jest.advanceTimersByTime( 20 * 1000 );
		} );
		unmount();

		// Returning must not fire a send…
		const secondSend = mockSendVerificationEmail();
		render();

		// …and the countdown resumes from what was left rather than resetting to 60.
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 40s' } ) ).toBeVisible()
		);
		expect( secondSend.isDone() ).toBe( false );
	} );

	it( 'catches the cooldown up after the tab was suspended', async () => {
		jest.useFakeTimers();

		render();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Resend in 60s' } ) ).toBeVisible()
		);

		// Simulate a phone suspending JS while the user is in their email app: the
		// clock jumps past the cooldown without the per-second interval firing.
		act( () => {
			jest.setSystemTime( Date.now() + 65 * 1000 );
			document.dispatchEvent( new Event( 'visibilitychange' ) );
		} );

		// On return, the cooldown reflects real elapsed time, not the paused counter.
		expect( screen.getByRole( 'button', { name: 'Resend' } ) ).toBeVisible();
	} );

	it( 'restarts the polling window after a resend so a later remote confirmation still advances', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		// The poll is a no-op until the user confirms on another device.
		( fetchCurrentUser as jest.Mock ).mockReturnValue( { type: 'TEST_NOOP' } );
		const { onDone } = render();

		// The poll runs while the window is open.
		await jest.advanceTimersByTimeAsync( 10 * 1000 );
		expect( fetchCurrentUser ).toHaveBeenCalled();

		// After 15 minutes the window lapses and polling switches itself off.
		await jest.advanceTimersByTimeAsync( 15 * 60 * 1000 );
		( fetchCurrentUser as jest.Mock ).mockClear();
		await jest.advanceTimersByTimeAsync( 10 * 1000 );
		expect( fetchCurrentUser ).not.toHaveBeenCalled();

		// The user confirms on another device; the next poll would now see it.
		( fetchCurrentUser as jest.Mock ).mockImplementation( () => setUserEmailVerified( true ) );

		// Resending restarts the window. Waiting for the fresh cooldown confirms the
		// send resolved and its state (including the reopened window) has applied.
		mockSendVerificationEmail();
		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /Resend in \d+s/ } ) ).toBeVisible()
		);

		// The restarted poll fires, picks up the confirmation, and advances.
		await jest.advanceTimersByTimeAsync( 5000 );
		await waitFor( () => expect( onDone ).toHaveBeenCalled() );
	} );
} );
