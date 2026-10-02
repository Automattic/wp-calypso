/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/is-woo-jpc-flow', () => jest.fn( () => false ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	usePartnerBranding: jest.fn( () => ( { hasCustomBranding: false, topBarLogo: undefined } ) ),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { fireEvent, screen } from '@testing-library/react';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import LoginContextProvider from 'calypso/login/login-context';
import oauth2ClientsReducer from 'calypso/state/oauth2-clients/reducer';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import OneLoginLayout, { ensureHeadingProvided } from '../one-login-layout';

describe( 'ensureHeadingProvided', () => {
	const originalEnv = process.env.NODE_ENV;

	afterEach( () => {
		process.env.NODE_ENV = originalEnv;
	} );

	test( 'returns the heading when provided', () => {
		expect( ensureHeadingProvided( 'Hello' ) ).toBe( 'Hello' );
	} );

	test( 'throws in non-production environments when heading is missing', () => {
		expect( () => ensureHeadingProvided( undefined ) ).toThrow(
			/OneLoginLayout rendered without heading text/i
		);
	} );

	test( 'does not throw in production even when heading is missing', () => {
		process.env.NODE_ENV = 'production';
		expect( ensureHeadingProvided( undefined ) ).toBeNull();
	} );
} );

describe( 'OneLoginLayout', () => {
	const renderLayout = ( loginUrl: string ) => (
		<LoginContextProvider initialHeading="Create your account" initialSubHeading="Sub">
			<OneLoginLayout isJetpack={ false } isSectionSignup loginUrl={ loginUrl }>
				<div>form</div>
			</OneLoginLayout>
		</LoginContextProvider>
	);

	test( 'keeps the same Log in anchor mounted when the login URL changes', () => {
		const { rerender } = renderWithProvider( renderLayout( '/log-in?email_address=' ) );

		const link = screen.getByRole( 'link', { name: 'Log in' } );

		rerender( renderLayout( '/log-in?email_address=someone%40example.com' ) );

		const linkAfterRerender = screen.getByRole( 'link', { name: 'Log in' } );
		expect( linkAfterRerender ).toBe( link );
		expect( linkAfterRerender ).toHaveAttribute(
			'href',
			'/log-in?email_address=someone%40example.com'
		);
	} );
} );

describe( 'OneLoginLayout logo link', () => {
	const renderLayout = (
		props: Partial< React.ComponentProps< typeof OneLoginLayout > > = {},
		options = {}
	) =>
		renderWithProvider(
			<LoginContextProvider initialHeading="Log in" initialSubHeading="Sub">
				<OneLoginLayout isJetpack={ false } { ...props }>
					<div>form</div>
				</OneLoginLayout>
			</LoginContextProvider>,
			options
		);

	afterEach( () => {
		( recordTracksEvent as jest.Mock ).mockClear();
		( isWooJPCFlow as unknown as jest.Mock ).mockReturnValue( false );
		( usePartnerBranding as jest.Mock ).mockReturnValue( {
			hasCustomBranding: false,
			topBarLogo: undefined,
		} );
	} );

	test( 'records a login event when the logo is clicked', () => {
		renderLayout( { linkLogoToHome: true } );
		fireEvent.click( screen.getByRole( 'link', { name: 'WordPress.com home' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_login_logo_click',
			expect.any( Object )
		);
	} );

	test( 'records a signup event when the logo is clicked on signup', () => {
		renderLayout( { linkLogoToHome: true, isSectionSignup: true } );
		fireEvent.click( screen.getByRole( 'link', { name: 'WordPress.com home' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_logo_click',
			expect.any( Object )
		);
	} );

	test( 'links the logo to the homepage when linkLogoToHome is set', () => {
		renderLayout( { linkLogoToHome: true } );
		expect( screen.getByRole( 'link', { name: 'WordPress.com home' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/'
		);
	} );

	test( 'does not link the logo by default', () => {
		renderLayout();
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not link the logo for Jetpack logins', () => {
		renderLayout( { linkLogoToHome: true, isJetpack: true } );
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not link the logo for Jetpack connector logins', () => {
		renderLayout( { linkLogoToHome: true, isFromJetpackConnector: true } );
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not link the logo for Jetpack onboarding and connector flows', () => {
		renderLayout( { linkLogoToHome: true, isUnifiedConnectionFlow: true } );
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not link the logo in the Woo JPC flow', () => {
		( isWooJPCFlow as unknown as jest.Mock ).mockReturnValue( true );
		renderLayout( { linkLogoToHome: true } );
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not link the logo for OAuth2 client logins', () => {
		renderLayout(
			{ linkLogoToHome: true },
			{
				initialState: { oauth2Clients: { ui: { currentClientId: 930 } } },
				reducers: { oauth2Clients: oauth2ClientsReducer },
			}
		);
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not link the logo with partner branding', () => {
		( usePartnerBranding as jest.Mock ).mockReturnValue( {
			hasCustomBranding: true,
			topBarLogo: undefined,
		} );
		renderLayout( { linkLogoToHome: true } );
		expect( screen.queryByRole( 'link', { name: 'WordPress.com home' } ) ).not.toBeInTheDocument();
	} );
} );
