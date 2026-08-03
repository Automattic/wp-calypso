/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import SignupFormSocialFirst, {
	MobileCompactTosNotice,
} from 'calypso/blocks/signup-form/signup-form-social-first';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';

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
			const allowedServices: SignupAllowedService[] = [ 'google', 'paypal' ];

			render(
				<SignupFormSocialFirst { ...defaultProps } allowedSocialServices={ allowedServices } />
			);

			// Verify filtered buttons are rendered
			expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
			expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		} );
	} );

	describe( 'isMobileCompactVariant', () => {
		test( 'renders the mobile-compact wrapper class', () => {
			const { container } = render(
				<SignupFormSocialFirst { ...defaultProps } isMobileCompactVariant />
			);

			expect(
				container.querySelector( '.signup-form-social-first--mobile-compact' )
			).toBeInTheDocument();
		} );

		test( 'omits the "Have an account? Log in" paragraph', () => {
			const { container } = render(
				<SignupFormSocialFirst { ...defaultProps } isMobileCompactVariant />
			);

			expect(
				container.querySelector( '.signup-form-social-first__login-link' )
			).not.toBeInTheDocument();
		} );

		test( 'renders the "options above" ToS when no customTosElement is provided', () => {
			const { container } = render(
				<SignupFormSocialFirst { ...defaultProps } isMobileCompactVariant />
			);

			expect(
				screen.getByText( /By continuing with any of the options above/i )
			).toBeInTheDocument();
			expect(
				screen.queryByText( /By continuing with any of the options listed/i )
			).not.toBeInTheDocument();
			// Regression: exactly one tos-link <p> — guards against double-wrapping
			// when a future caller routes <MobileCompactTosNotice /> through
			// customTosElement (which renderTermsOfService would wrap in <p>).
			expect( container.querySelectorAll( '.signup-form-social-first__tos-link' ) ).toHaveLength(
				1
			);
		} );

		test( 'renders the partner customTosElement instead of the default ToS', () => {
			const customTos = <span data-testid="partner-tos">Partner terms</span>;

			render(
				<SignupFormSocialFirst
					{ ...defaultProps }
					isMobileCompactVariant
					customTosElement={ customTos }
				/>
			);

			expect( screen.getByTestId( 'partner-tos' ) ).toBeInTheDocument();
			expect(
				screen.queryByText( /By continuing with any of the options above/i )
			).not.toBeInTheDocument();
		} );

		test( 'renders the OR divider between social and email blocks', () => {
			const { container } = render(
				<SignupFormSocialFirst { ...defaultProps } isMobileCompactVariant />
			);

			expect( container.querySelector( '.auth-form__separator' ) ).toBeInTheDocument();
		} );

		test( 'forwards allowedSocialServices to the social row', () => {
			// `apple_oauth_client_id` isn't mocked, so the Apple button skips itself —
			// use the same google/paypal pair the upstream allowedSocialServices test uses.
			const allowedServices: SignupAllowedService[] = [ 'google', 'paypal' ];

			render(
				<SignupFormSocialFirst
					{ ...defaultProps }
					isMobileCompactVariant
					allowedSocialServices={ allowedServices }
				/>
			);

			expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
			expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
			expect( screen.queryByText( /Continue with GitHub/i ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'MobileCompactTosNotice', () => {
		test( 'renders the "options above" copy', () => {
			render( <MobileCompactTosNotice /> );

			expect(
				screen.getByText( /By continuing with any of the options above/i )
			).toBeInTheDocument();
		} );
	} );

	describe( 'isEmailAtBottom', () => {
		test( 'renders the email block after the social buttons when isEmailAtBottom is true', () => {
			const { container } = render(
				<SignupFormSocialFirst { ...defaultProps } isEmailFirstVariant isEmailAtBottom />
			);

			const emailBlock = container.querySelector( '.signup-form-social-first-email' );
			const googleButton = screen.getByText( /Continue with Google/i );

			expect( emailBlock ).not.toBeNull();
			// DOCUMENT_POSITION_FOLLOWING (4) → emailBlock follows googleButton in DOM order.
			expect(
				googleButton.compareDocumentPosition( emailBlock as Node ) &
					Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
		} );
	} );
} );
