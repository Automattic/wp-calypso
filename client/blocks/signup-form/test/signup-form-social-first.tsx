/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

	describe( 'emailUpdate', () => {
		const emailUpdate = { submit: jest.fn(), cancel: jest.fn() };
		const renderUpdating = ( props = {} ) =>
			render(
				<SignupFormSocialFirst
					{ ...defaultProps }
					userEmail="typo@example.com"
					emailUpdate={ emailUpdate }
					{ ...props }
				/>
			);

		beforeEach( () => jest.clearAllMocks() );

		it( "replaces the way back to the social screen with the caller's own", () => {
			renderUpdating();

			expect( screen.queryByRole( 'button', { name: 'See all options' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		} );

		it( "keeps the caller's own way back where the step container owns the footer", () => {
			renderUpdating( { backButtonInFooter: true } );

			expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		} );

		it( 'takes the standard layout rather than the compact one that shows social', () => {
			renderUpdating( { isMobileCompactVariant: true } );

			// The compact layout has no screens and no Cancel; the standard one keeps social on the
			// screen it isn't showing.
			expect(
				screen
					.getAllByRole( 'button', { name: /Continue with/ } )[ 0 ]
					.closest( '.signup-form-social-first-screen' )
			).not.toHaveClass( 'visible' );
			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		} );

		it( 'says it is updating, not signing up, while the request is in flight', async () => {
			renderUpdating( {
				emailUpdate: { submit: () => new Promise< void >( () => {} ), cancel: jest.fn() },
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( await screen.findByRole( 'button', { name: 'Updating…' } ) ).toBeVisible();
		} );

		it( 'holds the way back shut when the caller says a change is on its way', async () => {
			const cancel = jest.fn();
			renderUpdating( { emailUpdate: { submit: jest.fn(), cancel, cancelDisabled: true } } );

			await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

			expect( cancel ).not.toHaveBeenCalled();
		} );

		it( 'leaves the way back open otherwise', async () => {
			const cancel = jest.fn();
			renderUpdating( { emailUpdate: { submit: () => new Promise< void >( () => {} ), cancel } } );

			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

			expect( cancel ).toHaveBeenCalled();
		} );

		it( 'shows the email screen even when it was given no address to start from', () => {
			renderUpdating( { userEmail: '' } );

			expect(
				screen.getByRole( 'textbox' ).closest( '.signup-form-social-first-screen' )
			).toHaveClass( 'visible' );
		} );

		it( 'shows what the caller has to say, and a partner its own terms', () => {
			renderUpdating( {
				notice: <div>That address is already in use.</div>,
				customTosElement: <span>Partner terms apply.</span>,
			} );

			const emailScreen = within(
				screen.getByRole( 'textbox' ).closest( '.signup-form-social-first-screen' ) as HTMLElement
			);
			expect( emailScreen.getByText( 'That address is already in use.' ) ).toBeVisible();
			expect( emailScreen.queryByText( /By clicking "Continue,"/ ) ).not.toBeInTheDocument();

			// Partner copy points at the options below it, so it can't sit under them.
			const terms = emailScreen.getByText( 'Partner terms apply.' );
			expect(
				terms.compareDocumentPosition( screen.getByRole( 'button', { name: 'Continue' } ) )
			).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
		} );

		// Otherwise a refusal leaves the field and the button with nothing to press.
		it( 'gives the screen back when the change is refused', async () => {
			renderUpdating( {
				emailUpdate: { submit: () => Promise.reject( new Error( 'nope' ) ), cancel: jest.fn() },
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( await screen.findByRole( 'button', { name: 'Continue' } ) ).toBeEnabled();
		} );
	} );

	it.each( [
		[ true, 'Back', 'See all options' ],
		[ false, 'See all options', 'Back' ],
	] )(
		'leaves an ordinary signup its own way back, footer: %s',
		( backButtonInFooter, shown, hidden ) => {
			render(
				<SignupFormSocialFirst
					{ ...defaultProps }
					userEmail="new@example.com"
					backButtonInFooter={ backButtonInFooter }
				/>
			);

			expect( screen.getByRole( 'button', { name: shown } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: hidden } ) ).not.toBeInTheDocument();
		}
	);

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
