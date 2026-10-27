/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/lib/partner-branding', () => ( {
	usePartnerBranding: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/tracks' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => {
	const actual = jest.requireActual( 'calypso/lib/explat' );
	return { ...actual, useExperiment: jest.fn( actual.useExperiment ) };
} );

import { fireEvent, screen } from '@testing-library/dom';
import { useViewportMatch } from '@wordpress/compose';
import { MemoryRouter } from 'react-router-dom';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useExperiment } from 'calypso/lib/explat';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep, { type UserStepAccepts } from '..';

const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUsePartnerBranding = usePartnerBranding as unknown as jest.Mock;
const mockUseExperiment = useExperiment as unknown as jest.Mock;

const ENTRY_CLARITY_EXPERIMENT = 'calypso_account_step_entry_clarity_202609';

// Answers for the entry-clarity experiment only, the way ExPlat does: no assignment for an
// ineligible user. The step's other experiments keep the real hook.
const setEntryClarityArm = ( variationName: 'control' | 'treatment', isLoading = false ) =>
	mockUseExperiment.mockImplementation( ( name: string, options?: { isEligible?: boolean } ) => {
		if ( name !== ENTRY_CLARITY_EXPERIMENT ) {
			return jest.requireActual( 'calypso/lib/explat' ).useExperiment( name, options );
		}
		if ( options?.isEligible === false ) {
			return [ false, null ];
		}
		return [ isLoading, isLoading ? null : { variationName } ];
	} );

const isEligibleForEntryClarity = () =>
	mockUseExperiment.mock.calls
		.filter( ( [ name ] ) => name === ENTRY_CLARITY_EXPERIMENT )
		.at( -1 )?.[ 1 ]?.isEligible;

// isMobileViewport is useViewportMatch( 'small', '<' ) at 600px and isLargeViewport is
// useViewportMatch( 'large' ) at 960px. Pass both to reach the band in between.
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
		mockUseExperiment.mockClear();
		setEntryClarityArm( 'treatment' );
	} );

	const renderUserStep = (
		url = '/onboarding/user?user_email=test@example.com',
		props: Partial< UserStepAccepts > = {},
		flow = 'onboarding'
	) => {
		return renderWithProvider(
			<MemoryRouter initialEntries={ [ url ] }>
				<UserStep flow={ flow } stepName="user" navigation={ { submit: jest.fn() } } { ...props } />
			</MemoryRouter>,
			{ reducers: { login: loginReducer, route: routeReducer } }
		);
	};

	describe( 'top bar logo', () => {
		it( 'links the logo to the homepage in the onboarding flow', () => {
			renderUserStep();
			expect( screen.getByRole( 'link', { name: 'WordPress.com home' } ) ).toHaveAttribute(
				'href',
				'https://wordpress.com/'
			);
		} );

		it( 'does not link the logo in other flows', () => {
			renderUserStep( '/site-setup/user', {}, 'site-setup' );
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'link', { name: 'WordPress.com home' } )
			).not.toBeInTheDocument();
		} );

		it( 'does not link the logo with partner branding', () => {
			mockUsePartnerBranding.mockReturnValue( { ...noPartnerBranding, hasCustomBranding: true } );
			renderUserStep();
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'link', { name: 'WordPress.com home' } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'Log in link tracking', () => {
		beforeEach( () => {
			( recordTracksEvent as jest.Mock ).mockClear();
		} );

		it.each( [
			[ 'form', '/onboarding/user', 'onboarding', false ],
			[ 'top-bar', '/onboarding/user', 'onboarding', true ],
			[ 'form', '/onboarding/user?ref=woo-hosting-solutions-flow', 'onboarding', false ],
			[ 'top-bar', '/test-flow/user', 'test-flow', false ],
		] )( 'records a click on the %s link at %s', ( origin, url, flow, isMobile ) => {
			setViewport( { isMobile } );
			renderUserStep( url, {}, flow );
			fireEvent.click( screen.getByRole( 'link', { name: 'Log in' } ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_login_link_click', {
				flow,
				step: 'user',
				origin,
			} );
		} );
	} );

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

	describe( 'theme grid layout', () => {
		const themeGridUrl = '/onboarding/user?ref=marketing_bar&signup_layout=theme_grid';
		const pitch = 'Turn your idea into a real website';

		it( 'puts the theme grid before an email-first form on desktop', () => {
			renderUserStep( themeGridUrl );

			const heading = screen.getByRole( 'heading', { name: 'Create an account to get started' } );
			expect( heading ).toBeVisible();
			expect( screen.getByText( pitch ) ).toBeVisible();
			expect(
				screen.getByText( pitch ).compareDocumentPosition( heading ) &
					Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
			expect( screen.getByLabelText( 'Enter your email' ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: /Continue with email/i } )
			).not.toBeInTheDocument();
		} );

		it.each( [
			[ 'mobile', { isMobile: true } ],
			[ 'the band between the breakpoints', { isMobile: false, isLarge: false } ],
		] )( 'shows only the strip above the form on %s', ( _label, viewport ) => {
			setViewport( viewport );

			const { container } = renderUserStep( themeGridUrl );

			expect( container.querySelector( '.signup-theme-grid--compact' ) ).toBeInTheDocument();
			expect( screen.queryByText( pitch ) ).not.toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { name: 'Create an account to get started' } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'heading', { name: 'Welcome to WordPress.com' } )
			).not.toBeInTheDocument();
		} );

		it( 'keeps the default layout without the parameter', () => {
			const { container } = renderUserStep( '/onboarding/user?ref=marketing_bar' );

			expect( screen.getByRole( 'heading', { name: 'Create your account' } ) ).toBeVisible();
			expect( container.querySelector( '.signup-theme-grid' ) ).not.toBeInTheDocument();
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

	describe( 'entry clarity experiment', () => {
		const loginLinkSelector = '.signup-form-social-first__login-link';
		const gapClass = 'step-container-v2--user-entry-clarity';
		const emailButtonIcon = () =>
			screen.getByRole( 'button', { name: /Continue with email/i } ).querySelector( 'svg' );

		it( 'gives treatment the in-form "Log in", the envelope and the login heading gap', () => {
			const { container } = renderUserStep();

			expect( container.querySelector( loginLinkSelector ) ).toBeVisible();
			// One route to logging in, not two: the top bar no longer carries its own.
			expect( screen.getAllByRole( 'link', { name: 'Log in' } ) ).toHaveLength( 1 );
			expect(
				screen.getByRole( 'link', { name: 'Log in' } ).closest( loginLinkSelector )
			).toBeVisible();
			expect( emailButtonIcon() ).toHaveClass( 'social-icons__envelope' );
			expect( container.getElementsByClassName( gapClass ) ).toHaveLength( 1 );
		} );

		it.each( [
			[ 'control', false ],
			[ 'treatment while the assignment loads', true ],
		] )( 'keeps the current experience for %s', ( _label, isLoading ) => {
			setEntryClarityArm( isLoading ? 'treatment' : 'control', isLoading );

			const { container } = renderUserStep();

			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
			expect( emailButtonIcon() ).not.toHaveClass( 'social-icons__envelope' );
			expect( container.getElementsByClassName( gapClass ) ).toHaveLength( 0 );
		} );

		it( 'leaves the compact mobile layout out of the experiment', () => {
			setViewport( { isMobile: true } );

			const { container } = renderUserStep();

			expect( isEligibleForEntryClarity() ).toBe( false );
			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
		} );

		it( 'leaves the band between the breakpoints out of the experiment', () => {
			// Between 600px and 960px the login link stays in the top bar, matching login.
			setViewport( { isMobile: false, isLarge: false } );

			const { container } = renderUserStep();

			expect( isEligibleForEntryClarity() ).toBe( false );
			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Log in' } ) ).toBeVisible();
		} );

		it.each( [
			[ 'other flows', '/site-setup/user', 'site-setup' ],
			[ 'Woo-referrer users', '/onboarding/user?ref=woo-hosting-solutions-flow', 'onboarding' ],
			[ 'the theme grid layout', '/onboarding/user?signup_layout=theme_grid', 'onboarding' ],
		] )( 'leaves %s out of the experiment', ( _label, url, flow ) => {
			renderUserStep( url, {}, flow );

			expect( isEligibleForEntryClarity() ).toBe( false );
		} );

		it( 'drops the link entirely when hideLoginLink is set', () => {
			const { container } = renderUserStep( '/onboarding/user', { hideLoginLink: true } );

			expect( container.querySelector( loginLinkSelector ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'link', { name: 'Log in' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
