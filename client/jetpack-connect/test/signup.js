/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
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

	describe( 'isFromJetpackConnector', () => {
		const isFromJetpackConnector = new JetpackSignup().isFromJetpackConnector;

		test( 'is from jetpack connector', () => {
			const props = {
				authQuery: {
					from: 'jetpack-connector',
				},
			};

			expect( isFromJetpackConnector( props ) ).toBe( true );
		} );

		test( 'does not match jetpack-connector prefix variants', () => {
			const props = {
				authQuery: {
					from: 'jetpack-connector-v2',
				},
			};

			expect( isFromJetpackConnector( props ) ).toBe( false );
		} );

		test( 'is not from jetpack connector', () => {
			const props = {
				authQuery: {
					from: 'jetpack-onboarding',
				},
			};

			expect( isFromJetpackConnector( props ) ).toBe( false );
		} );
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

		test( 'returns true for jetpack-onboarding', () => {
			const props = {
				authQuery: {
					from: 'jetpack-onboarding',
				},
			};

			expect( instance.isUnifiedConnectionFlow( props ) ).toBe( true );
		} );

		test( 'returns true for jetpack-connector', () => {
			const props = {
				authQuery: {
					from: 'jetpack-connector',
				},
			};

			expect( instance.isUnifiedConnectionFlow( props ) ).toBe( true );
		} );

		test( 'returns false for other flows', () => {
			const props = {
				authQuery: {
					from: 'woocommerce-onboarding',
				},
			};

			expect( instance.isUnifiedConnectionFlow( props ) ).toBe( false );
		} );
	} );
} );
