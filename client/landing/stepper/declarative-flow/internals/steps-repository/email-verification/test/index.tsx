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
import currentUserReducer from 'calypso/state/current-user/reducer';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import EmailVerification from '..';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StepProps } from '../../../types';

jest.mock( 'calypso/lib/analytics/tracks' );

const EMAIL = 'onboarder@example.com';
const COOLDOWN_MS = 60 * 1000;

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const mockSendVerificationEmail = ( response: { success: boolean } = { success: true } ) =>
	mockApi().post( '/rest/v1.1/me/send-verification-email' ).reply( 200, response );

const mockFetchUser = ( emailVerified: boolean ) =>
	mockApi()
		.get( '/rest/v1.1/me' )
		.query( true )
		.reply( 200, { ID: 1, email: EMAIL, email_verified: emailVerified } );

const mockFetchUserError = () =>
	mockApi().get( '/rest/v1.1/me' ).query( true ).reply( 500, { error: 'server_error' } );

const currentUserState = ( emailVerified: boolean ) => ( {
	currentUser: {
		id: 1,
		user: { ID: 1, email: EMAIL, email_verified: emailVerified },
	},
} );

const stepProps = ( props?: Partial< StepProps > ) =>
	mockStepProps( {
		stepName: 'email-verification',
		flow: 'onboarding',
		...props,
	} );

const render = ( {
	emailVerified = false,
	...props
}: Partial< StepProps > & { emailVerified?: boolean } = {} ) =>
	renderStep( <EmailVerification { ...stepProps( props ) } />, {
		initialState: currentUserState( emailVerified ),
	} );

describe( 'EmailVerification', () => {
	beforeAll( () => nock.disableNetConnect() );

	afterEach( () => {
		jest.clearAllMocks();
		jest.useRealTimers();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'sends a fresh confirmation email on mount and shows where it went', async () => {
		const request = mockSendVerificationEmail();

		render();

		expect( screen.getByRole( 'heading', { name: 'Confirm your email address' } ) ).toBeVisible();
		expect( screen.getByText( EMAIL ) ).toBeVisible();

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_signup_email_verification_email_sent',
				{ flow: 'onboarding', is_resend: false }
			)
		);
	} );

	it( 'submits straight away when the email is already confirmed, without sending again', async () => {
		const submit = jest.fn();
		const request = mockSendVerificationEmail();

		render( { emailVerified: true, navigation: { submit } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
		expect( request.isDone() ).toBe( false );
	} );

	it( 'advances as soon as the confirmation lands in another tab', async () => {
		mockSendVerificationEmail();
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
				user: { ID: 1, email: EMAIL, email_verified: true },
			} );
		} );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
	} );

	it( 'lets the user carry on without confirming', async () => {
		mockSendVerificationEmail();
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
		mockSendVerificationEmail();
		mockFetchUser( true );
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'I’ve confirmed my email' } ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { emailVerified: true } ) );
	} );

	it( 'tells the user when the manual check still shows the email unconfirmed', async () => {
		mockSendVerificationEmail();
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
		mockSendVerificationEmail();
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

	it( 'surfaces an unsuccessful send and keeps resend available', async () => {
		mockSendVerificationEmail( { success: false } );

		render();

		expect( await screen.findByText( /We couldn’t send the email\./ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'resend the email' } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_email_verification_email_send_failed',
			expect.objectContaining( { flow: 'onboarding', is_resend: false } )
		);
	} );

	it( 'holds off on resending until the cooldown expires', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		mockSendVerificationEmail();

		render();

		// The send on mount starts the cooldown, so there is nothing to click yet.
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
} );
