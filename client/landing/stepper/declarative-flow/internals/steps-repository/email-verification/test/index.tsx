/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
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
import EmailVerification from '..';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StepProps } from '../../../types';

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

// The gate only activates for a brand-new email signup; the user step sets this
// flag on account creation. Existing/social users don't have it.
const markNewSignup = () => localStorage.setItem( `wpcom_signup_is_new_user_${ USER_ID }`, 'true' );

const stepProps = ( props?: Partial< StepProps > ) =>
	mockStepProps( {
		stepName: 'email-verification',
		flow: 'onboarding',
		...props,
	} );

const render = ( {
	emailVerified = false,
	newSignup = true,
	...props
}: Partial< StepProps > & { emailVerified?: boolean; newSignup?: boolean } = {} ) => {
	if ( newSignup ) {
		markNewSignup();
	}
	return renderStep( <EmailVerification { ...stepProps( props ) } />, {
		initialState: currentUserState( emailVerified ),
	} );
};

describe( 'EmailVerification', () => {
	beforeAll( () => nock.disableNetConnect() );

	afterEach( () => {
		jest.clearAllMocks();
		jest.useRealTimers();
		nock.cleanAll();
		sessionStorage.clear();
		localStorage.clear();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'does not resend on mount (signup already sent one) and shows where the link went', async () => {
		const request = mockSendVerificationEmail();

		render();

		expect( screen.getByRole( 'heading', { name: 'Confirm your email address' } ) ).toBeVisible();
		expect( screen.getByText( EMAIL ) ).toBeVisible();

		// The signup activation email is treated as the initial send: the cooldown is
		// seeded and the "sent" event recorded, without hitting the endpoint again.
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 60s\./ ) ).toBeVisible()
		);
		expect( request.isDone() ).toBe( false );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			{ flow: 'onboarding', is_resend: false }
		);
	} );

	it( 'keeps resend available after refreshing once the cooldown has expired', async () => {
		jest.useFakeTimers();

		const { unmount } = render();
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 60s\./ ) ).toBeVisible()
		);

		// The whole cooldown elapses, then the user refreshes (remount).
		act( () => {
			jest.advanceTimersByTime( 61 * 1000 );
		} );
		unmount();

		const secondSend = mockSendVerificationEmail();
		render();

		// Resend is available immediately — no fresh 60-second wait, and no new email.
		expect( await screen.findByRole( 'button', { name: 'resend the email' } ) ).toBeVisible();
		expect( screen.queryByText( /You can resend the email in \d+s\./ ) ).not.toBeInTheDocument();
		expect( secondSend.isDone() ).toBe( false );
	} );

	it( 'passes an already-verified user straight through without sending or tracking', async () => {
		const submit = jest.fn();
		const request = mockSendVerificationEmail();

		render( { emailVerified: true, navigation: { submit } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
		expect( request.isDone() ).toBe( false );
		expect(
			screen.queryByRole( 'heading', { name: 'Confirm your email address' } )
		).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.anything()
		);
	} );

	it( 'passes existing (non-signup) users straight through without a gate', async () => {
		const submit = jest.fn();
		const request = mockSendVerificationEmail();

		render( { newSignup: false, navigation: { submit } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: false } ) );
		expect( request.isDone() ).toBe( false );
		expect(
			screen.queryByRole( 'heading', { name: 'Confirm your email address' } )
		).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.anything()
		);
	} );

	it( 'advances as soon as the confirmation lands in another tab', async () => {
		markNewSignup();
		const submit = jest.fn();
		// Only the slices this step touches: its own user state, plus the two
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
				<EmailVerification { ...stepProps( { navigation: { submit } } ) } />
			</MemoryRouter>,
			{ store }
		);

		expect( submit ).not.toHaveBeenCalled();

		// `UserVerificationChecker` refetches the user when the confirmation
		// landing page signals it from the other tab; this is what lands in the store.
		act( () => {
			store.dispatch( {
				type: CURRENT_USER_RECEIVE,
				user: { ID: USER_ID, email: EMAIL, email_verified: true },
			} );
		} );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_confirmed',
			expect.objectContaining( { flow: 'onboarding' } )
		);
	} );

	it( 'lets the user carry on without confirming', async () => {
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ll do this later' } ) );

		expect( submit ).toHaveBeenCalledWith( { emailVerified: false } );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_skipped',
			expect.objectContaining( { flow: 'onboarding' } )
		);
	} );

	it( 'advances when the manual check finds the email confirmed', async () => {
		mockFetchUser( true );
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
	} );

	it( 'tells the user when the manual check still shows the email unconfirmed', async () => {
		mockFetchUser( false );
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		expect(
			await screen.findByText( /We haven’t received your confirmation yet\./ )
		).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'distinguishes a failed check request from an unconfirmed email', async () => {
		mockFetchUserError();
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		expect( await screen.findByText( /We couldn’t check right now\./ ) ).toBeVisible();
		expect(
			screen.queryByText( /We haven’t received your confirmation yet\./ )
		).not.toBeInTheDocument();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'surfaces an unsuccessful resend and keeps resend available', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

		render();

		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 60s\./ ) ).toBeVisible()
		);
		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );

		mockSendVerificationEmail( { success: false } );
		await user.click( await screen.findByRole( 'button', { name: 'resend the email' } ) );

		expect( await screen.findByText( /We couldn’t send the email\./ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'resend the email' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_send_failed',
			expect.objectContaining( { flow: 'onboarding', is_resend: true } )
		);
	} );

	it( 'holds off on resending until the seeded cooldown expires', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

		render();

		// The seeded cooldown (from the signup email) means there is nothing to click yet.
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 60s\./ ) ).toBeVisible()
		);
		expect( screen.queryByRole( 'button', { name: 'resend the email' } ) ).not.toBeInTheDocument();

		act( () => {
			jest.advanceTimersByTime( COOLDOWN_MS );
		} );

		const resendRequest = mockSendVerificationEmail();
		await user.click( await screen.findByRole( 'button', { name: 'resend the email' } ) );

		await waitFor( () => expect( resendRequest.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_signup_email_verification_email_sent',
				{ flow: 'onboarding', is_resend: true }
			)
		);
	} );

	it( 'keeps the cooldown when the step is revisited within the window, without resending', async () => {
		jest.useFakeTimers();

		const { unmount } = render();
		// The cooldown is seeded from the signup email, without a send.
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 60s\./ ) ).toBeVisible()
		);

		// 20 seconds of the 60-second cooldown elapse, then the user leaves the step.
		act( () => {
			jest.advanceTimersByTime( 20 * 1000 );
		} );
		unmount();

		// Returning to the step must not fire a send…
		const secondSend = mockSendVerificationEmail();
		render();

		// …and the countdown resumes from what was left rather than resetting to 60.
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 40s\./ ) ).toBeVisible()
		);
		expect( secondSend.isDone() ).toBe( false );
	} );

	it( 'catches the cooldown up after the tab was suspended', async () => {
		jest.useFakeTimers();

		render();
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in 60s\./ ) ).toBeVisible()
		);

		// Simulate a phone suspending JS while the user is in their email app: the
		// clock jumps past the cooldown without the per-second interval firing.
		act( () => {
			jest.setSystemTime( Date.now() + 65 * 1000 );
			document.dispatchEvent( new Event( 'visibilitychange' ) );
		} );

		// On return, the cooldown reflects real elapsed time, not the paused counter.
		expect( screen.getByRole( 'button', { name: 'resend the email' } ) ).toBeVisible();
	} );

	it( 'restarts the polling window after a resend so a later remote confirmation still advances', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		// The poll is a no-op until the user confirms on another device.
		( fetchCurrentUser as jest.Mock ).mockReturnValue( { type: 'TEST_NOOP' } );
		const submit = jest.fn();

		render( { navigation: { submit } } );

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
		await user.click( await screen.findByRole( 'button', { name: 'resend the email' } ) );
		await waitFor( () =>
			expect( screen.getByText( /You can resend the email in \d+s\./ ) ).toBeVisible()
		);

		// The restarted poll fires, picks up the confirmation, and advances.
		await jest.advanceTimersByTimeAsync( 5000 );
		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
	} );
} );
