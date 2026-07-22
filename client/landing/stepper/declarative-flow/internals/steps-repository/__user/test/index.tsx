/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/lib/partner-branding', () => ( {
	usePartnerBranding: jest.fn(),
} ) );

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

import { screen } from '@testing-library/dom';
import { useViewportMatch } from '@wordpress/compose';
import { MemoryRouter } from 'react-router-dom';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';

const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUsePartnerBranding = usePartnerBranding as unknown as jest.Mock;

// Drives isMobileViewport = useViewportMatch( 'small', '<' ). Every other call
// (e.g. useViewportMatch( 'large' )) resolves to false, i.e. not a wide viewport.
const setViewport = ( { isMobile }: { isMobile: boolean } ) =>
	mockUseViewportMatch.mockImplementation( ( breakpoint: string, operator?: string ) =>
		breakpoint === 'small' && operator === '<' ? isMobile : false
	);

const noPartnerBranding = {
	hasCustomBranding: false,
	partnerConfig: null,
	topBarLogo: undefined,
	signupTosElement: undefined,
};

describe( 'User email signup step', () => {
	beforeEach( () => {
		setViewport( { isMobile: false } );
		mockUsePartnerBranding.mockReturnValue( noPartnerBranding );
	} );

	const renderUserStep = ( url = '/onboarding/user?user_email=test@example.com' ) => {
		return renderWithProvider(
			<MemoryRouter initialEntries={ [ url ] }>
				<UserStep flow="onboarding" stepName="user" navigation={ { submit: jest.fn() } } />
			</MemoryRouter>,
			{ reducers: { login: loginReducer, route: routeReducer } }
		);
	};

	it( 'passes userEmail from user_email query param to SignupFormSocialFirst', () => {
		renderUserStep( '/onboarding/user?user_email=hello@wp.com' );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( 'hello@wp.com' );
	} );

	it( 'defaults userEmail to empty string when user_email is missing', () => {
		renderUserStep( '/onboarding/user' );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( '' );
	} );

	describe( 'mobile compact layout', () => {
		it( 'renders the default heading on desktop viewports', () => {
			renderUserStep();
			expect( screen.getByRole( 'heading', { name: 'Create your account' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'heading', { name: 'Welcome to WordPress.com' } )
			).not.toBeInTheDocument();
		} );

		it( 'renders the compact layout with in-form ToS on mobile viewports', () => {
			setViewport( { isMobile: true } );

			renderUserStep();

			expect( screen.getByRole( 'heading', { name: 'Welcome to WordPress.com' } ) ).toBeVisible();
			expect( screen.getByText( 'Sign up free to start creating your site.' ) ).toBeVisible();
			// "Above" copy: ToS lives inside the form, below the sign-up options.
			expect( screen.getByText( /By continuing with any of the options above/i ) ).toBeVisible();
		} );

		it( 'excludes Woo-referrer users from the compact layout on mobile', () => {
			setViewport( { isMobile: true } );

			renderUserStep( '/onboarding/user?ref=woo-hosting-solutions-flow' );

			expect( screen.getByRole( 'heading', { name: 'Create your account' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'heading', { name: 'Welcome to WordPress.com' } )
			).not.toBeInTheDocument();
			expect(
				screen.queryByText( /By continuing with any of the options above/i )
			).not.toBeInTheDocument();
		} );

		it( 'preserves partner branding over the compact layout on mobile', () => {
			setViewport( { isMobile: true } );
			mockUsePartnerBranding.mockReturnValue( {
				hasCustomBranding: true,
				partnerConfig: { id: 'woo', displayName: 'Woo', ssoProviders: [ 'google', 'apple' ] },
				topBarLogo: undefined,
				signupTosElement: <>Partner reminder: agree to our partner Terms of Service.</>,
			} );

			renderUserStep();

			expect( screen.getByRole( 'heading', { name: 'Create an account for Woo' } ) ).toBeVisible();
			expect( screen.getByText( /Partner reminder: agree to our partner/i ) ).toBeVisible();
			// The compact "options above" notice is not rendered for partner flows.
			expect(
				screen.queryByText( /By continuing with any of the options above/i )
			).not.toBeInTheDocument();
		} );
	} );
} );
