/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import SignupFormSocialFirst from 'calypso/blocks/signup-form/signup-form-social-first';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

// Mock the analytics module
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
	getDoNotTrack: jest.fn( () => false ),
	isPiiUrl: jest.fn( () => false ),
	getCurrentUser: jest.fn( () => null ),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		if ( key === 'wpcom_signup_id' ) {
			return 'test-id';
		}
		if ( key === 'wpcom_signup_key' ) {
			return 'test-key';
		}
		return null;
	};
	config.isEnabled = ( feature: string ) => {
		if ( feature === 'sign-in-with-paypal' ) {
			return true;
		}
		return false;
	};
	return config;
} );

const defaultProps = {
	goToNextStep: jest.fn(),
	stepName: 'user',
	flowName: 'onboarding',
	redirectToAfterLoginUrl: 'https://example.com',
	logInUrl: '/log-in',
	socialServiceResponse: {},
	handleSocialResponse: jest.fn(),
	queryArgs: {},
	userEmail: '',
	notice: false as const,
	isSocialFirst: true,
};

const render = ( el: React.ReactElement, options = {} ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

describe( 'SignupFormSocialFirst', () => {
	describe( 'customTosElement', () => {
		test( 'renders custom ToS element when provided', () => {
			const customTos = (
				<span data-testid="custom-tos">
					Custom Terms of Service for <a href="/tos">Partner</a>
				</span>
			);

			render( <SignupFormSocialFirst { ...defaultProps } customTosElement={ customTos } /> );

			const customTosElement = screen.getByTestId( 'custom-tos' );
			expect( customTosElement ).toBeInTheDocument();
			expect( screen.getByText( /Custom Terms of Service for/i ) ).toBeInTheDocument();
			expect(
				customTosElement.closest( '.signup-form-social-first__tos-link' )
			).toBeInTheDocument();
		} );

		test( 'renders default ToS when customTosElement is not provided', () => {
			render( <SignupFormSocialFirst { ...defaultProps } /> );

			expect(
				screen.getByText( /By continuing with any of the options listed/i )
			).toBeInTheDocument();
		} );

		test( 'custom ToS element takes priority over default', () => {
			const customTos = <span data-testid="custom-tos">Partner specific terms</span>;

			render( <SignupFormSocialFirst { ...defaultProps } customTosElement={ customTos } /> );

			// Custom ToS should be visible
			expect( screen.getByTestId( 'custom-tos' ) ).toBeInTheDocument();
			// Default ToS text should not be in the initial screen
			expect(
				screen.queryByText( /By continuing with any of the options listed/i )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'allowedSocialServices', () => {
		test( 'passes allowedSocialServices to SocialSignupForm', () => {
			const allowedServices = [ 'google', 'paypal' ];

			render(
				<SignupFormSocialFirst { ...defaultProps } allowedSocialServices={ allowedServices } />
			);

			// Verify filtered buttons are rendered
			expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
			expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		} );
	} );
} );
