/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import deepFreeze from 'deep-freeze';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import purchasesReducer from 'calypso/state/purchases/reducer';
import siteConnectionReducer from 'calypso/state/site-connection/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../client/test-helpers/testing-library';
import { JetpackAuthorize } from '../authorize';
import { JPC_PATH_PLANS } from '../constants';
import { OFFER_RESET_FLOW_TYPES } from '../flow-types';

const noop = () => {};
const CLIENT_ID = 98765;
const SITE_SLUG = 'an.example.site';
const DEFAULT_PROPS = deepFreeze( {
	authAttempts: 0,
	authorizationData: {
		authorizeError: false,
		authorizeSuccess: false,
		clientId: CLIENT_ID,
		clientNotResponding: true,
		isAuthorizing: false,
		timestamp: 1509368045859,
		userAlreadyConnected: false,
	},
	authorize: noop,
	authQuery: {
		authApproved: false,
		blogname: 'Example Blog',
		clientId: CLIENT_ID,
		closeWindowAfterLogin: false,
		closeWindowAfterAuthorize: false,
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
	calypsoStartedConnection: false,
	hasExpiredSecretError: false,
	hasXmlrpcError: false,
	isAlreadyOnSitesList: false,
	isFetchingAuthorizationSite: false,
	isFetchingSites: false,
	recordTracksEvent: noop,
	retryAuth: noop,
	siteSlug: SITE_SLUG,
	translate: ( string ) => string,
	user: {
		display_name: "A User's Name",
	},
	partnerSlug: null,
	selectedPlanSlug: null,
	siteHasJetpackPaidProduct: false,
	userAlreadyConnected: false,
	userHasUnattachedLicenses: false,
} );

const APPROVE_SSO_CLIENT_ID = 99821;

jest.mock( '../persistence-utils', () => ( {
	...jest.requireActual( '../persistence-utils' ),
	isSsoApproved: ( clientId ) => clientId === APPROVE_SSO_CLIENT_ID,
} ) );

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		reducers: {
			ui: uiReducer,
			documentHead: documentHeadReducer,
			purchases: purchasesReducer,
			siteConnection: siteConnectionReducer,
		},
	} );
}

let windowOpenSpy;

beforeEach( () => {
	windowOpenSpy = jest.spyOn( global.window, 'open' ).mockImplementation( jest.fn() );
} );

afterEach( () => {
	windowOpenSpy?.mockRestore();
} );

describe( 'JetpackAuthorize', () => {
	test( 'renders as expected', () => {
		const { container } = renderWithRedux( <JetpackAuthorize { ...DEFAULT_PROPS } /> );

		expect( container ).toMatchSnapshot();
	} );

	describe( 'isSso', () => {
		const isSso = new JetpackAuthorize().isSso;
		const queryDataSiteId = 12349876;

		test( 'returns true for valid SSO', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'sso',
					clientId: APPROVE_SSO_CLIENT_ID,
				},
			};
			expect( isSso( props ) ).toBe( true );
		} );

		test( 'returns false with non-sso from', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'elsewhere',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false without approved cookie', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false with no cookie or queryDataSiteId', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: null,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );
	} );

	describe( 'isWooRedirect', () => {
		const isWooRedirect = new JetpackAuthorize().isWooRedirect;

		test( 'should return true for woo services', () => {
			const props = { authQuery: { from: 'woocommerce-services-auto-authorize' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'should return true for old woo setup wizard', () => {
			const props = { authQuery: { from: 'woocommerce-setup-wizard' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'should return true for legacy woo onboarding', () => {
			const props = { authQuery: { from: 'woocommerce-onboarding' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'returns false with non-woo from', () => {
			const props = { authQuery: { from: 'elsewhere' } };
			expect( isWooRedirect( props ) ).toBeFalsy();
		} );
	} );

	describe( 'shouldAutoAuthorize', () => {
		let authorizeMock;

		beforeEach( () => {
			authorizeMock = jest.fn();
		} );

		test( 'should authorize if isSso', () => {
			const authQuery = {
				...DEFAULT_PROPS.authQuery,
				from: 'sso',
				clientId: APPROVE_SSO_CLIENT_ID,
			};

			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authorize={ authorizeMock }
					authQuery={ authQuery }
				/>
			);

			expect( authorizeMock ).toHaveBeenCalled();
		} );

		test( 'should auto-authorize for WOO services', () => {
			const authQuery = {
				...DEFAULT_PROPS.authQuery,
				from: 'woocommerce-services-auto-authorize',
			};

			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authorize={ authorizeMock }
					authQuery={ authQuery }
				/>
			);

			expect( authorizeMock ).toHaveBeenCalled();
		} );

		test( 'should not auto-authorize for WOO onboarding', () => {
			const authQuery = {
				...DEFAULT_PROPS.authQuery,
				from: 'woocommerce-onboarding',
			};

			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authorize={ authorizeMock }
					authQuery={ authQuery }
				/>
			);

			expect( authorizeMock ).not.toHaveBeenCalled();
		} );

		test( 'should auto-authorize for the old WOO setup wizard', () => {
			const authQuery = {
				...DEFAULT_PROPS.authQuery,
				from: 'woocommerce-setup-wizard',
			};

			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authorize={ authorizeMock }
					authQuery={ authQuery }
				/>
			);

			expect( authorizeMock ).toHaveBeenCalled();
		} );
	} );

	describe( 'isJetpackUpgradeFlow', () => {
		const isJetpackUpgradeFlow = new JetpackAuthorize().isJetpackUpgradeFlow;

		test( 'should see plans', () => {
			const props = {
				authQuery: {
					redirectAfterAuth: 'page=jetpack&action=something_else',
				},
			};

			expect( isJetpackUpgradeFlow( props ) ).toBe( false );
		} );

		test( 'should be sent back', () => {
			const props = {
				authQuery: {
					redirectAfterAuth: 'page=jetpack&action=authorize_redirect',
				},
			};

			expect( isJetpackUpgradeFlow( props ) ).toBe( true );
		} );
	} );

	describe( 'isFromJetpackConnectionManager', () => {
		const isFromJetpackConnectionManager = new JetpackAuthorize().isFromJetpackConnectionManager;

		test( 'is from connection manager', () => {
			const props = {
				authQuery: {
					from: 'connection-ui',
				},
			};

			expect( isFromJetpackConnectionManager( props ) ).toBe( true );
		} );

		test( 'is not from connection manager', () => {
			const props = {
				authQuery: {
					from: 'not-connection-ui',
				},
			};

			expect( isFromJetpackConnectionManager( props ) ).toBe( false );
		} );
	} );

	describe( 'isFromJetpackOnboardingFlow', () => {
		const isFromJetpackOnboarding = new JetpackAuthorize().isFromJetpackOnboarding;

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
					from: 'not-jetpack-onboarding',
				},
			};

			expect( isFromJetpackOnboarding( props ) ).toBe( false );
		} );
	} );

	describe( 'isFromJetpackBackupPlugin', () => {
		const isFromJetpackBackupPlugin = new JetpackAuthorize().isFromJetpackBackupPlugin;

		test( 'is from backup plugin', () => {
			const props = {
				authQuery: {
					from: 'jetpack-backup',
				},
			};

			expect( isFromJetpackBackupPlugin( props ) ).toBe( true );
		} );

		test( 'is not from backup plugin', () => {
			const props = {
				authQuery: {
					from: 'not-jetpack-backup',
				},
			};

			expect( isFromJetpackBackupPlugin( props ) ).toBe( false );
		} );
	} );

	describe( 'isFromJetpackBoost', () => {
		const isFromJetpackBoost = new JetpackAuthorize().isFromJetpackBoost;

		test( 'is from jetpack boost', () => {
			const props = {
				authQuery: {
					from: 'jetpack-boost-something',
				},
			};

			expect( isFromJetpackBoost( props ) ).toBe( true );
		} );

		test( 'is not from jetpack boost', () => {
			const props = {
				authQuery: {
					from: 'not-jetpack-boost-something',
				},
			};

			expect( isFromJetpackBoost( props ) ).toBe( false );
		} );
	} );

	describe( 'getRedirectionTarget', () => {
		let originalWindowLocation;

		beforeEach( () => {
			originalWindowLocation = global.window.location;
			delete global.window.location;
			global.window.location = {
				href: 'http://wwww.example.com',
				origin: 'http://www.example.com',
			};
		} );

		afterEach( () => {
			global.window.location = originalWindowLocation;
		} );

		test( 'should redirect to /checkout if the selected plan/product is Jetpack plan/product', async () => {
			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
					} }
					isAlreadyOnSitesList
					isFetchingSites
					selectedPlanSlug={ OFFER_RESET_FLOW_TYPES[ 0 ] }
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			expect( windowOpenSpy ).toHaveBeenCalledWith(
				`/checkout/${ SITE_SLUG }/${ OFFER_RESET_FLOW_TYPES[ 0 ] }`,
				expect.any( String )
			);
		} );

		test( 'should redirect to wp-admin when site has a purchased plan/product', async () => {
			delete global.window.location;
			global.window.location = {
				href: 'http://wwww.example.com',
				origin: 'http://www.example.com',
			};

			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
					} }
					isAlreadyOnSitesList
					isFetchingSites
					siteHasJetpackPaidProduct
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			expect( windowOpenSpy ).toHaveBeenCalledWith(
				DEFAULT_PROPS.authQuery.redirectAfterAuth,
				expect.any( String )
			);
		} );

		test( 'should redirect to /jetpack/connect/plans when user has an unattached "user"(not partner) license key', async () => {
			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
					} }
					isAlreadyOnSitesList
					isFetchingSites
					userHasUnattachedLicenses
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			expect( windowOpenSpy ).toHaveBeenCalledWith(
				`${ JPC_PATH_PLANS }/${ SITE_SLUG }?redirect_to=${ encodeURIComponent(
					DEFAULT_PROPS.authQuery.redirectAfterAuth
				) }`,
				expect.any( String )
			);
		} );

		test( 'should redirect to the /jetpack/connect/plans page by default', async () => {
			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
					} }
					isAlreadyOnSitesList
					isFetchingSites
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			expect( windowOpenSpy ).toHaveBeenCalledWith(
				`${ JPC_PATH_PLANS }/${ SITE_SLUG }?redirect_to=${ encodeURIComponent(
					DEFAULT_PROPS.authQuery.redirectAfterAuth
				) }`,
				expect.any( String )
			);
		} );
	} );

	describe( 'handleSignIn', () => {
		let originalWindowLocation;

		beforeEach( () => {
			originalWindowLocation = global.window.location;
			delete global.window.location;
			global.window.location = {
				href: 'http://wwww.example.com',
				origin: 'http://www.example.com',
			};
		} );

		afterEach( () => {
			global.window.location = originalWindowLocation;
		} );

		test( 'should redirect to url that returns from props.logoutUser', async () => {
			const redirectTo = 'http://www.example.com/redirect';
			const logoutUser = jest.fn().mockResolvedValue( {
				redirect_to: redirectTo,
			} );
			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
					} }
					isAlreadyOnSitesList
					isFetchingSites
					logoutUser={ logoutUser }
				/>
			);

			await userEvent.click( screen.getByText( 'Sign in as a different user' ) );
			expect( global.window.location.href ).toBe( redirectTo );
			expect( logoutUser ).toHaveBeenCalled();
		} );

		test( 'should redirect to jetpack login page for woo onboarding', async () => {
			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
						from: 'woocommerce-onboarding',
					} }
					isAlreadyOnSitesList
					isFetchingSites
				/>
			);

			await userEvent.click( screen.getByText( 'Sign in as a different user' ) );
			expect( global.window.location.href ).toBe(
				'https://example.com/log-in/jetpack?redirect_to=http%3A%2F%2Fwwww.example.com&from=woocommerce-onboarding'
			);
		} );

		test( 'should redirect to jetpack login page for woo core profiler', async () => {
			renderWithRedux(
				<JetpackAuthorize
					{ ...DEFAULT_PROPS }
					authQuery={ {
						...DEFAULT_PROPS.authQuery,
						alreadyAuthorized: true,
						from: 'woocommerce-core-profiler',
					} }
					isAlreadyOnSitesList
					isFetchingSites
				/>
			);

			await userEvent.click( screen.getByText( 'Sign in as a different user' ) );
			expect( global.window.location.href ).toBe(
				'https://example.com/log-in/jetpack?redirect_to=http%3A%2F%2Fwwww.example.com&from=woocommerce-core-profiler'
			);
		} );
	} );
} );
