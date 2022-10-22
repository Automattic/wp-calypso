/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import deepFreeze from 'deep-freeze';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import happychatReducer from 'calypso/state/happychat/reducer';
import purchasesReducer from 'calypso/state/purchases/reducer';
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
			happychat: happychatReducer,
		},
	} );
}

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn( ( featureFlag ) => {
		if ( featureFlag === 'jetpack/magic-link-signup' ) {
			return false;
		}
		return true;
	} );
	return mock;
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

		test( 'should return true for new woo onboarding', () => {
			const props = { authQuery: { from: 'woocommerce-onboarding' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'returns false with non-woo from', () => {
			const props = { authQuery: { from: 'elsewhere' } };
			expect( isWooRedirect( props ) ).toBeFalsy();
		} );
	} );

	describe( 'shouldAutoAuthorize', () => {
		test( 'should authorize if isSso', () => {
			const authorizeMock = jest.fn();

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
			const authorizeMock = jest.fn();

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
			const authorizeMock = jest.fn();

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
			const authorizeMock = jest.fn();

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
		test( 'should redirect to pressable if partnerSlug is "pressable"', async () => {
			const originalWindowLocation = global.window.location;
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
					partnerSlug="pressable"
					isAlreadyOnSitesList={ true }
					isFetchingSites={ true }
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			const target = global.window.location.href;

			global.window.location = originalWindowLocation;

			expect( target ).toBe( `/start/pressable-nux?blogid=${ DEFAULT_PROPS.authQuery.clientId }` );
		} );

		test( 'should redirect to /checkout if the selected plan/product is Jetpack plan/product', async () => {
			const originalWindowLocation = global.window.location;
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
					isAlreadyOnSitesList={ true }
					isFetchingSites={ true }
					selectedPlanSlug={ OFFER_RESET_FLOW_TYPES[ 0 ] }
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			const target = global.window.location.href;

			global.window.location = originalWindowLocation;

			expect( target ).toBe( `/checkout/${ SITE_SLUG }/${ OFFER_RESET_FLOW_TYPES[ 0 ] }` );
		} );

		test( 'should redirect to wp-admin when site has a purchased plan/product', async () => {
			const originalWindowLocation = global.window.location;
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
					isAlreadyOnSitesList={ true }
					isFetchingSites={ true }
					siteHasJetpackPaidProduct={ true }
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			const target = global.window.location.href;

			global.window.location = originalWindowLocation;

			expect( target ).toBe( DEFAULT_PROPS.authQuery.redirectAfterAuth );
		} );

		test( 'should redirect to /jetpack/connect/plans when user has an unattached "user"(not partner) license key', async () => {
			const originalWindowLocation = global.window.location;
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
					isAlreadyOnSitesList={ true }
					isFetchingSites={ true }
					userHasUnattachedLicenses={ true }
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			const target = global.window.location.href;

			global.window.location = originalWindowLocation;

			expect( target ).toBe(
				`${ JPC_PATH_PLANS }/${ SITE_SLUG }?redirect=${ encodeURIComponent(
					DEFAULT_PROPS.authQuery.redirectAfterAuth
				) }`
			);
		} );

		test( 'should redirect to redirect to the /jetpack/connect/plans page by default', async () => {
			const originalWindowLocation = global.window.location;
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
					isAlreadyOnSitesList={ true }
					isFetchingSites={ true }
				/>
			);

			await userEvent.click( screen.getByText( 'Return to your site' ) );

			const target = global.window.location.href;

			global.window.location = originalWindowLocation;

			expect( target ).toBe(
				`${ JPC_PATH_PLANS }/${ SITE_SLUG }?redirect=${ encodeURIComponent(
					DEFAULT_PROPS.authQuery.redirectAfterAuth
				) }`
			);
		} );
	} );
} );
