/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
import { createRef } from 'react';
import loginReducer from 'calypso/state/login/reducer';
import siteConnectionReducer from 'calypso/state/site-connection/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { JetpackSignup } from '../signup.jsx';

jest.mock( 'calypso/components/data/document-head', () => () => 'DocumentHead' );
jest.mock( 'calypso/components/social-buttons/google', () => () => 'GoogleSocialButton' );
jest.mock( 'calypso/components/social-buttons/apple', () => () => 'AppleLoginButton' );
jest.mock( 'calypso/components/social-buttons/github', () => () => 'GitHubLoginButton' );

const render = ( el, options ) =>
	renderWithProvider( el, {
		reducers: {
			login: loginReducer,
			siteConnection: siteConnectionReducer,
			ui: uiReducer,
		},
		...options,
	} );

const noop = () => {};
const CLIENT_ID = 98765;
const SITE_SLUG = 'an.example.site';
const DEFAULT_PROPS = deepFreeze( {
	authorizationData: {
		authorizeError: false,
		authorizeSuccess: false,
		clientId: CLIENT_ID,
		clientNotResponding: true,
		isAuthorizing: false,
		timestamp: 1509368045859,
		userAlreadyConnected: false,
	},
	authQuery: {
		authApproved: false,
		blogname: 'Example Blog',
		clientId: CLIENT_ID,
		from: 'banner-44-slide-1-dashboard',
		homeUrl: `http://${ SITE_SLUG }`,
		jpVersion: '5.4',
		nonce: 'fooBarNonce',
		redirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
		redirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
		scope: 'administrator:fooBarBaz',
		secret: 'fooBarSecret',
		site: `http://${ SITE_SLUG }`,
		siteIcon: '',
		siteUrl: `http://${ SITE_SLUG }`,
		state: '1',
		userEmail: `email@${ SITE_SLUG }`,
	},
	createAccount: noop,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	translate: ( string ) => string,
} );

describe( 'JetpackSignup', () => {
	let originalScrollTo;

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = () => null;
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;
	} );

	test( 'should render', () => {
		const { container } = render( <JetpackSignup { ...DEFAULT_PROPS } /> );

		expect( container ).toMatchSnapshot();
	} );

	test( 'should render with locale suggestions', () => {
		const { container } = render(
			<JetpackSignup
				{ ...DEFAULT_PROPS }
				authorizationData={ {
					...DEFAULT_PROPS.authorizationData,
					locale: 'es',
				} }
				locale="es"
				path="/jetpack/connect/authorize/es"
			/>
		);

		expect( container ).toMatchSnapshot();
	} );

	test( 'should render with the connector branding when from=jetpack-connector', () => {
		const { container } = render(
			<JetpackSignup
				{ ...DEFAULT_PROPS }
				authQuery={ {
					...DEFAULT_PROPS.authQuery,
					from: 'jetpack-connector',
					plugins: [ 'jetpack', 'woocommerce' ],
				} }
			/>
		);

		expect( container ).toMatchSnapshot();
	} );

	// Unified-flow signup surface contract:
	//  - The existing-account escape hatch renders for both unified flows
	//    (jetpack-connector and jetpack-onboarding).
	//  - The features section is intentionally NOT rendered on signup —
	//    it lives on the authorize surface only. The signup page already
	//    carries the brand context via BrandHeader, so duplicating the
	//    feature cards below the form was overstuffing the layout.
	test( 'connector flow renders the existing-account link and no features section', () => {
		const { container } = render(
			<JetpackSignup
				{ ...DEFAULT_PROPS }
				authQuery={ {
					...DEFAULT_PROPS.authQuery,
					from: 'jetpack-connector',
					plugins: [ 'woocommerce', 'jetpack' ],
				} }
			/>
		);

		expect( screen.getByText( /Already have a WordPress.com account\?/ ) ).toBeInTheDocument();
		expect( container.querySelector( '.connect-screen-features-section' ) ).not.toBeInTheDocument();
	} );

	test( 'onboarding flow renders the existing-account link and no features section', () => {
		const { container } = render(
			<JetpackSignup
				{ ...DEFAULT_PROPS }
				authQuery={ {
					...DEFAULT_PROPS.authQuery,
					from: 'jetpack-onboarding',
				} }
			/>
		);

		expect( screen.getByText( /Already have a WordPress.com account\?/ ) ).toBeInTheDocument();
		expect( container.querySelector( '.connect-screen-features-section' ) ).not.toBeInTheDocument();
	} );

	test.each( [ 'jetpack_premium_analytics_onboarding', 'delete_connection_owner_notice' ] )(
		'from=%s renders the connector header and the existing-account link',
		( from ) => {
			const { container } = render(
				<JetpackSignup
					{ ...DEFAULT_PROPS }
					authQuery={ { ...DEFAULT_PROPS.authQuery, from, plugins: [ 'jetpack' ] } }
				/>
			);

			expect(
				container.querySelector( '.jetpack-connect__authorize-form-wrapper--connector' )
			).toBeInTheDocument();
			expect( container.querySelector( '.connect-screen-brand-header' ) ).toBeInTheDocument();
			expect( screen.getByText( /Already have a WordPress.com account\?/ ) ).toBeInTheDocument();
		}
	);

	test.each( [ 'jetpack-newsletter', 'jetpack-x_y' ] )(
		'from=%s keeps the legacy signup header',
		( from ) => {
			const { container } = render(
				<JetpackSignup { ...DEFAULT_PROPS } authQuery={ { ...DEFAULT_PROPS.authQuery, from } } />
			);

			expect(
				container.querySelector( '.jetpack-connect__authorize-form-wrapper--connector' )
			).not.toBeInTheDocument();
			expect( container.querySelector( '.connect-screen-brand-header' ) ).not.toBeInTheDocument();
		}
	);

	test( 'non-unified flow renders neither the existing-account link nor the features section', () => {
		const { container } = render(
			<JetpackSignup
				{ ...DEFAULT_PROPS }
				authQuery={ {
					...DEFAULT_PROPS.authQuery,
					from: 'banner-44-slide-1-dashboard',
					plugins: [ 'woocommerce' ],
				} }
			/>
		);

		expect(
			screen.queryByText( /Already have a WordPress.com account\?/ )
		).not.toBeInTheDocument();
		expect( container.querySelector( '.connect-screen-features-section' ) ).not.toBeInTheDocument();
	} );

	test( 'handleSubmitSignup forwards from and plugins from authQuery into the signup extra bag', async () => {
		const createAccount = jest.fn().mockResolvedValue( {} );
		const signupRef = createRef();

		render(
			<JetpackSignup
				ref={ signupRef }
				{ ...DEFAULT_PROPS }
				createAccount={ createAccount }
				authQuery={ {
					...DEFAULT_PROPS.authQuery,
					from: 'jetpack-connector',
					plugins: [ 'woocommerce', 'jetpack' ],
				} }
			/>
		);

		await act( async () => {
			signupRef.current.handleSubmitSignup( null, { extra: {} } );
		} );

		expect( createAccount ).toHaveBeenCalledWith(
			expect.objectContaining( {
				extra: expect.objectContaining( {
					from: 'jetpack-connector',
					plugins: [ 'woocommerce', 'jetpack' ],
				} ),
			} )
		);
	} );

	describe( 'isFromJetpackOnboarding', () => {
		const isFromJetpackOnboarding = new JetpackSignup().isFromJetpackOnboarding;

		test( 'is from jetpack onboarding', () => {
			const props = {
				authQuery: {
					from: 'jetpack-onboarding',
				},
			};

			expect( isFromJetpackOnboarding( props ) ).toBe( true );
		} );

		test( 'is not from jetpack onboarding', () => {
			const props = {
				authQuery: {
					from: 'jetpack-connector',
				},
			};

			expect( isFromJetpackOnboarding( props ) ).toBe( false );
		} );
	} );

	describe( 'isUnifiedConnectionFlow', () => {
		const instance = new JetpackSignup();

		test.each( [
			[ 'jetpack-onboarding', true ],
			[ 'jetpack-connector', true ],
			[ 'jetpack_premium_analytics_onboarding', true ],
			[ 'woocommerce-onboarding', false ],
			[ 'jetpack-newsletter', false ],
			[ 'jetpack-x_y', false ],
		] )( 'from=%s → %s', ( from, expected ) => {
			expect( instance.isUnifiedConnectionFlow( { authQuery: { from } } ) ).toBe( expected );
		} );
	} );
} );
