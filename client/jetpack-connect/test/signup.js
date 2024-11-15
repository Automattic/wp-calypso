/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
import loginReducer from 'calypso/state/login/reducer';
import siteConnectionReducer from 'calypso/state/site-connection/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { JetpackSignup } from '../signup.js';

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

	test( 'should render WC Payments specific sub header copy', () => {
		const props = {
			...DEFAULT_PROPS,
			authQuery: {
				...DEFAULT_PROPS.authQuery,
				from: 'woocommerce-payments',
				woodna_service_name: 'WooPayments',
				isFullLoginFormVisible: false,
			},
		};

		const expectedText =
			'Enter your email address to get started. Your account will enable you to start using the features and benefits offered by WooPayments';

		render( <JetpackSignup { ...props } /> );

		expect( screen.getByText( expectedText ) ).toBeVisible();
		expect( screen.getByText( expectedText ) ).toHaveClass( 'formatted-header__subtitle' );
	} );
} );
