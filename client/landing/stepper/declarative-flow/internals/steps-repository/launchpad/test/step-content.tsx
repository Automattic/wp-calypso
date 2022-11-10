/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import * as redux from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import * as sendEmail from '../../../../../../../landing/stepper/hooks/use-send-email-verification';
import EmailValidationBanner from '../email-validation-banner';
import StepContent from '../step-content';

const props = {
	siteSlug: 'testsite.wordpress.com',
	/* eslint-disable @typescript-eslint/no-empty-function */
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
	/* eslint-enable @typescript-eslint/no-empty-function */
};

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/launchpad',
		search: `?flow=newsletter&siteSlug=${ props.siteSlug }`,
		hash: '',
		state: undefined,
	} ) ),
} ) );

const user = {
	ID: 1234,
	username: 'testUser',
	email: 'testemail@wordpress.com',
	email_verified: false,
};

function renderStepContent( emailVerified = false ) {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore(
		{
			...initialState,
			currentUser: {
				user: {
					...user,
					email_verified: emailVerified,
				},
			},
		},
		initialReducer
	);
	setStore( reduxStore, getStateFromCache( user.ID ) );
	const queryClient = new QueryClient();

	render(
		<redux.Provider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<StepContent { ...props }>
					<EmailValidationBanner />
				</StepContent>
			</QueryClientProvider>
		</redux.Provider>
	);
}

describe( 'EmailValidationBanner', () => {
	it( "shows the banner when the user's email is not verified", () => {
		renderStepContent( false );

		const emailValidationBanner = screen.queryByText(
			/Make sure to validate the email we sent to testemail@wordpress.com in order to publish and share your posts./i
		);

		expect( emailValidationBanner ).toBeInTheDocument();
	} );

	it( "hides the banner when the user's email is verified", () => {
		renderStepContent( true );

		const emailValidationBanner = screen.queryByText(
			/Make sure to validate the email we sent to testemail@wordpress.com in order to publish and share your posts./i
		);

		expect( emailValidationBanner ).not.toBeInTheDocument();
	} );

	it( 'change email link redirects to /me/account', () => {
		renderStepContent( false );

		expect( screen.getByRole( 'link', { name: 'change email address' } ) ).toHaveAttribute(
			'href',
			'/me/account'
		);
	} );

	it( 'hides the banner when clicking the close button', () => {
		renderStepContent( false );

		const closeButton = screen.getByLabelText( 'close' );
		const emailValidationBanner = screen.queryByText(
			/Make sure to validate the email we sent to testemail@wordpress.com in order to publish and share your posts./i
		);

		expect( emailValidationBanner ).toBeInTheDocument();

		fireEvent.click( closeButton );

		expect( emailValidationBanner ).not.toBeInTheDocument();
	} );

	it( 'fires success notice action when resend is successful', async () => {
		const dispatch = jest.fn();

		jest.spyOn( redux, 'useDispatch' ).mockReturnValue( dispatch );

		const useSendEmailVerification = jest.spyOn( sendEmail, 'useSendEmailVerification' );
		useSendEmailVerification.mockImplementation( () => () => {
			return Promise.resolve( {
				success: true,
			} );
		} );

		renderStepContent( false );

		const resendEmailButton = screen.queryByText( /Resend email/i );

		expect( resendEmailButton ).toBeInTheDocument();

		await userEvent.click( resendEmailButton as HTMLElement );

		expect( useSendEmailVerification ).toHaveBeenCalled();

		await waitFor( () => {
			expect(
				dispatch.mock.calls[ 0 ][ 0 ].notice.text.includes(
					'Verification email resent. Please check your inbox.'
				)
			).toBeTruthy();
		} );
	} );

	it( 'fires error notice action when resend is unsuccessful', async () => {
		const dispatch = jest.fn();

		jest.spyOn( redux, 'useDispatch' ).mockReturnValue( dispatch );

		const useSendEmailVerification = jest.spyOn( sendEmail, 'useSendEmailVerification' );
		useSendEmailVerification.mockImplementation( () => () => {
			return Promise.reject();
		} );

		renderStepContent( false );

		const resendEmailButton = screen.queryByText( /Resend email/i );

		expect( resendEmailButton ).toBeInTheDocument();

		await userEvent.click( resendEmailButton as HTMLElement );

		expect( useSendEmailVerification ).toHaveBeenCalled();

		await waitFor( () => {
			expect(
				dispatch.mock.calls[ 0 ][ 0 ].notice.text.includes(
					"Couldn't resend verification email. Please try again."
				)
			).toBeTruthy();
		} );
	} );
} );
