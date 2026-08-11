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
import UserStep, { type UserStepAccepts } from '..';

const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUsePartnerBranding = usePartnerBranding as unknown as jest.Mock;

// Drives the two breakpoints the step reads: isMobileViewport = useViewportMatch( 'small', '<' )
// at 660px, and isLargeViewport = useViewportMatch( 'large' ) at 960px. `isLarge` defaults to the
// opposite of `isMobile` so the common cases stay one argument; pass both to reach the band in
// between, where the layout is the standard one but the login link has not moved yet.
const setViewport = ( {
	isMobile,
	isLarge = ! isMobile,
}: {
	isMobile: boolean;
	isLarge?: boolean;
} ) =>
	mockUseViewportMatch.mockImplementation( ( breakpoint: string, operator?: string ) => {
		if ( breakpoint === 'small' && operator === '<' ) {
			return isMobile;
		}
		if ( breakpoint === 'large' ) {
			return isLarge;
		}
		return false;
	} );

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

	const renderUserStep = (
		url = '/onboarding/user?user_email=test@example.com',
		props: Partial< UserStepAccepts > = {}
	) => {
		return renderWithProvider(
			<MemoryRouter initialEntries={ [ url ] }>
				<UserStep
					flow="onboarding"
					stepName="user"
					navigation={ { submit: jest.fn() } }
					{ ...props }
				/>
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

	describe( 'accepts-props overrides', () => {
		it( 'overrides the heading with headerText', () => {
			renderUserStep( '/onboarding/user', { headerText: 'Join thousands of creators' } );
			expect( screen.getByRole( 'heading', { name: 'Join thousands of creators' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'heading', { name: 'Create your account' } )
			).not.toBeInTheDocument();
		} );

		it( 'renders subHeaderText beneath the title', () => {
			renderUserStep( '/onboarding/user', { subHeaderText: 'Free forever, no card required' } );
			expect( screen.getByText( 'Free forever, no card required' ) ).toBeVisible();
		} );

		it( 'renders with hideLoginLink and a restricted provider set without blowing up', () => {
			renderUserStep( '/onboarding/user', {
				hideLoginLink: true,
				allowedSocialServices: [ 'google', 'apple' ],
			} );
			expect( screen.getByRole( 'heading', { name: 'Create your account' } ) ).toBeVisible();
		} );
	} );

	describe( 'login link placement', () => {
		const loginLinkSelector = '.signup-form-social-first__login-link';

		it( 'answers "Have an account?" below the buttons rather than in the top bar', () => {
			const { container } = renderUserStep();

			expect( container.querySelector( loginLinkSelector ) ).toBeInTheDocument();
			// One route to logging in, not two: the top bar no longer carries its own.
			expect( screen.getAllByRole( 'link', { name: 'Log in' } ) ).toHaveLength( 1 );
			expect(
				screen.getByRole( 'link', { name: 'Log in' } ).closest( loginLinkSelector )
			).toBeInTheDocument();
		} );

		it( 'leaves the compact mobile layout on its top-bar link', () => {
			setViewport( { isMobile: true } );

			const { container } = renderUserStep();

			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
		} );

		it( 'leaves the band between the breakpoints on its top-bar link', () => {
			// Wide enough for the standard layout, not wide enough to be a desktop. Login keeps
			// its top-right link below 960px, so signup has to as well or the two diverge.
			setViewport( { isMobile: false, isLarge: false } );

			const { container } = renderUserStep();

			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
		} );

		it( 'drops the link entirely when hideLoginLink is set', () => {
			const { container } = renderUserStep( '/onboarding/user', { hideLoginLink: true } );

			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'link', { name: 'Log in' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
