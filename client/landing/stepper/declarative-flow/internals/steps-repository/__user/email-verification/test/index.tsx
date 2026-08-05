/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { type ReactNode } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import EmailVerificationGate from '..';
import { renderStep } from '../../../test/helpers';

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
const FLOW = 'onboarding';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const mockSendVerificationEmail = (
	response: { success: boolean; retry_after?: number } = { success: true }
) => mockApi().post( '/rest/v1.1/me/send-verification-email' ).reply( 200, response );

const captureSendVerificationEmail = () => {
	const sent: { from?: string }[] = [];
	mockApi()
		.post( '/rest/v1.1/me/send-verification-email', ( body ) => {
			sent.push( body );
			return true;
		} )
		.reply( 200, { success: true } );
	return sent;
};

const mockSendVerificationEmailThrottled = ( retryAfter: number ) =>
	mockApi()
		.post( '/rest/v1.1/me/send-verification-email' )
		.reply( 429, {
			error: 'throttled',
			message: 'You have requested too many verification emails.',
			data: { retry_after: retryAfter },
		} );

const currentUserState = ( emailVerified: boolean ) => ( {
	currentUser: {
		id: USER_ID,
		user: { ID: USER_ID, email: EMAIL, email_verified: emailVerified },
	},
} );

// A scope per test rather than a shared one: an attempt's record is recoverable from memory by
// design, so clearing storage between tests isn't what isolates them — a different attempt is.
let scopeCounter = 0;
let SCOPE = '';

const MINUTE = 60 * 1000;

// One step of fake time. The poll's interval is re-registered by an effect, so each change of
// rung needs its own `act` boundary to take hold.
const advance = ( ms: number ) =>
	act( () => {
		jest.advanceTimersByTime( ms );
	} );

const render = ( { logo }: { logo?: ReactNode } = {} ) => {
	const result = renderStep(
		<EmailVerificationGate flow={ FLOW } scope={ SCOPE } logo={ logo } />,
		{
			initialState: currentUserState( false ),
		}
	);
	return result;
};

describe( 'EmailVerificationGate', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		SCOPE = `${ FLOW }:${ USER_ID }:${ ++scopeCounter }`;
	} );

	afterEach( () => {
		jest.clearAllMocks();
		jest.useRealTimers();
		nock.cleanAll();
		localStorage.clear();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'opens ready to resend, without sending or recording a send', async () => {
		const request = mockSendVerificationEmail();

		render();

		expect( screen.getByRole( 'heading', { name: 'Verify your email' } ) ).toBeVisible();
		expect( screen.getByText( EMAIL ) ).toBeVisible();
		// Signup's activation email doesn't claim the server's interval, so nothing is held here.
		expect( await screen.findByRole( 'button', { name: 'Resend' } ) ).toBeEnabled();

		expect( request.isDone() ).toBe( false );
		// The initial send is recorded by the account step, not the gate.
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			expect.anything()
		);
	} );

	it( 'offers an inbox button that deep-links to a known provider', async () => {
		renderStep( <EmailVerificationGate flow={ FLOW } scope={ SCOPE } />, {
			initialState: {
				currentUser: {
					id: USER_ID,
					user: { ID: USER_ID, email: 'onboarder@gmail.com', email_verified: false },
				},
			},
		} );

		const openButton = await screen.findByRole( 'link', { name: 'Open email inbox' } );
		expect( openButton.getAttribute( 'href' ) ).toContain( 'mail.google.com' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_view',
			expect.objectContaining( { flow: FLOW, provider: 'gmail' } )
		);

		await userEvent.click( openButton );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_open_inbox',
			expect.objectContaining( { flow: FLOW, provider: 'gmail' } )
		);
	} );

	it( 'leaves resend as the only action for an unrecognized provider', () => {
		render();

		// `onboarder@example.com` has no known inbox link, and the poll is what resolves the
		// gate either way, so nothing stands in for the missing one.
		expect( screen.queryByRole( 'link', { name: /^Open / } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Resend' } ) ).toBeVisible();
		// The cohort still has to be countable, or its confirmations have nothing to divide by.
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_view',
			expect.objectContaining( { flow: FLOW, provider: 'none' } )
		);
	} );

	it( 'records the view once per gate, not once per mount', () => {
		const viewEvents = () =>
			( recordTracksEvent as jest.Mock ).mock.calls.filter(
				( [ event ] ) => event === 'calypso_signup_email_verification_view'
			);

		render().unmount();
		expect( viewEvents() ).toHaveLength( 1 );

		// A refresh lands on the same pending gate; the denominator must not count it twice.
		render();
		expect( viewEvents() ).toHaveLength( 1 );
	} );

	it( 'walks down the poll schedule without ever stopping', () => {
		jest.useFakeTimers();
		render();
		const poll = fetchCurrentUser as jest.Mock;

		// The span of each rung in minutes, so a rung's cost is what its own chunk of time bought.
		const requestsPerRung = [ 5, 5, 20, 30, 60 ].map( ( minutes ) => {
			poll.mockClear();
			advance( minutes * MINUTE );
			return poll.mock.calls.length;
		} );

		// Every 10s for five minutes, then 30s, a minute, and three minutes from half an hour on
		// — the floor, so a confirmation from a phone is never more than three minutes stale.
		expect( requestsPerRung ).toEqual( [ 30, 10, 20, 10, 20 ] );
	} );

	it( 'checks on focus, which is all a desktop mail client leaves to go on', () => {
		jest.useFakeTimers();
		render();
		const poll = fetchCurrentUser as jest.Mock;

		// Out to the slowest rung, where the next tick is minutes away.
		[ 5, 5, 20, 30 ].forEach( ( minutes ) => advance( minutes * MINUTE ) );

		// The tab was never hidden — verifying in another app raises no visibility change.
		poll.mockClear();
		act( () => {
			window.dispatchEvent( new Event( 'focus' ) );
		} );
		expect( poll ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'polls at the opening rate again after a resend', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const request = mockSendVerificationEmail();
		render();
		const poll = fetchCurrentUser as jest.Mock;

		// Out to the slowest rung, where a minute buys no request at all.
		[ 5, 5, 20, 30, 60 ].forEach( ( minutes ) => advance( minutes * MINUTE ) );
		poll.mockClear();
		advance( MINUTE );
		expect( poll ).not.toHaveBeenCalled();

		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );
		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		await screen.findByRole( 'button', { name: /^Resend \(/ } );

		poll.mockClear();
		advance( MINUTE );
		expect( poll ).toHaveBeenCalledTimes( 6 );
	} );

	it( 'holds the button for as long as the server says when it throttles', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		mockSendVerificationEmailThrottled( 25 * 60 );

		render();

		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		expect( await screen.findByRole( 'button', { name: 'Resend (25:00)' } ) ).toBeVisible();
		expect( screen.getByText( /Too many attempts/ ) ).toBeVisible();
		// A refusal is not a failure, so the generic send error stays away.
		expect( screen.queryByText( /We couldn’t send the email/ ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_send_failed',
			expect.objectContaining( { flow: FLOW, is_resend: true, error: 'throttled' } )
		);

		// A notice explaining a locked button must not outlive the lock.
		act( () => {
			jest.advanceTimersByTime( 25 * 60 * 1000 );
		} );
		expect( await screen.findByRole( 'button', { name: 'Resend' } ) ).toBeEnabled();
		expect( screen.queryByText( /Too many attempts/ ) ).not.toBeInTheDocument();
	} );

	it( 'resends, then holds for the wait the server reports', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		// Not always the interval: spending the daily allowance answers with its reset.
		const request = mockSendVerificationEmail( { success: true, retry_after: 4 * 60 * 60 } );

		render();

		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		expect( await screen.findByRole( 'button', { name: 'Resend (4:00:00)' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_sent',
			expect.objectContaining( { flow: FLOW, is_resend: true } )
		);
	} );

	it( 'asks for a link back to this flow, the same as the activation email did', async () => {
		const user = userEvent.setup();
		const sent = captureSendVerificationEmail();

		render();
		await user.click( await screen.findByRole( 'button', { name: 'Resend' } ) );

		await waitFor( () => expect( sent ).toHaveLength( 1 ) );
		expect( sent[ 0 ].from ).toBe( 'onboarding-with-email-verification' );
	} );
} );
