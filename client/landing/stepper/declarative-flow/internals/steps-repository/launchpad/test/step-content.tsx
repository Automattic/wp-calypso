/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
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
		<ReduxProvider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<StepContent { ...props }>
					<EmailValidationBanner />
				</StepContent>
			</QueryClientProvider>
		</ReduxProvider>
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
} );
