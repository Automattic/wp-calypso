/**
 * Internal dependencies
 */
import {
	canDoMagicLogin,
	getLoginLinkPageUrl,
	getSignupUrl,
	getSocialServiceFromClientId,
} from '..';
import { login } from 'calypso/lib/paths';
import config from '@automattic/calypso-config';

jest.mock( 'calypso/lib/paths' );
jest.mock( '@automattic/calypso-config', () => {
	const defaultExport = jest.fn();
	defaultExport.isEnabled = jest.fn();
	defaultExport.default = jest.fn();
	return defaultExport;
} );

const MOCK_LOCALE = 'en';
const MOCK_TWO_FACTOR_AUTH_TYPE = {
	default: 'link',
	jetpack: 'jetpack/link',
	gutenboarding: 'new/link',
};
const MOCK_CURRENT_ROUTES = { jetpack: '/log-in/jetpack', start: '/log-in' };
const MOCK_OAUTH_CLIENT = { default: { id: 12345 }, jetpack: { id: 68663 }, woo: { id: 50019 } };
const MOCK_WCCOM_FROM = 'testing';

const MOCK_CALYPSO_CONFIGS = {
	default: 99999,
	google_oauth_client_id: 11111,
	facebook_app_id: 22222,
	apple_oauth_client_id: 33333,
	signup_url: '/start',
};

const MOCK_CURRENT_QUERY = {
	redirect_to: '/start/domains',
};

describe( 'login', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'getSignupUrl', () => {
		beforeEach( () => {
			config.mockImplementation( ( key ) => MOCK_CALYPSO_CONFIGS[ key ] );
		} );

		it( 'should return the proper signup url with /start', () => {
			const expected = getSignupUrl(
				MOCK_CURRENT_QUERY,
				MOCK_CURRENT_ROUTES.start,
				null,
				MOCK_LOCALE,
				undefined,
				false
			);
			expect( expected ).toBe( '/start' );
		} );
	} );

	describe( 'getSocialServiceFromClientId', () => {
		beforeEach( () => {
			config.mockImplementation( ( key ) => MOCK_CALYPSO_CONFIGS[ key ] );
		} );

		it( 'should return null when no client id is provided', () => {
			expect( getSocialServiceFromClientId( undefined ) ).toBeNull();
		} );

		it( 'should return null when no client id matches', () => {
			expect( getSocialServiceFromClientId( MOCK_CALYPSO_CONFIGS.default ) ).toBeNull();
		} );

		it( 'should return google when client id matches', () => {
			expect( getSocialServiceFromClientId( MOCK_CALYPSO_CONFIGS.google_oauth_client_id ) ).toBe(
				'google'
			);
		} );

		it( 'should return facebook when client id matches', () => {
			expect( getSocialServiceFromClientId( MOCK_CALYPSO_CONFIGS.facebook_app_id ) ).toBe(
				'facebook'
			);
		} );

		it( 'should return apple when client id matches', () => {
			expect( getSocialServiceFromClientId( MOCK_CALYPSO_CONFIGS.apple_oauth_client_id ) ).toBe(
				'apple'
			);
		} );
	} );

	describe( 'getLoginLinkPageUrl', () => {
		it( 'should fallback to default when no locale is provided', () => {
			getLoginLinkPageUrl();

			expect( login ).toHaveBeenCalledWith( {
				locale: MOCK_LOCALE,
				twoFactorAuthType: MOCK_TWO_FACTOR_AUTH_TYPE.default,
			} );
		} );

		it( 'should set the right locale', () => {
			const expected = {
				locale: MOCK_LOCALE,
				twoFactorAuthType: MOCK_TWO_FACTOR_AUTH_TYPE.default,
			};
			getLoginLinkPageUrl( MOCK_LOCALE );
			expect( login ).toHaveBeenCalledWith( expected );
		} );

		it( 'should set the correct 2fa type for Jetpack', () => {
			const expected = {
				locale: MOCK_LOCALE,
				twoFactorAuthType: MOCK_TWO_FACTOR_AUTH_TYPE.jetpack,
			};

			getLoginLinkPageUrl( MOCK_LOCALE, MOCK_CURRENT_ROUTES.jetpack );
			expect( login ).toHaveBeenCalledWith( expected );
		} );

		it( 'should set the correct 2fa type for Gutenboarding', () => {
			const expected = {
				locale: MOCK_LOCALE,
				twoFactorAuthType: MOCK_TWO_FACTOR_AUTH_TYPE.gutenboarding,
			};

			getLoginLinkPageUrl( MOCK_LOCALE, undefined, true );
			expect( login ).toHaveBeenCalledWith( expected );
		} );
	} );

	describe( 'canDoMagicLogin', () => {
		beforeEach( () => {
			config.isEnabled.mockImplementation( () => true );
		} );

		it( 'should do magic login', () => {
			expect( canDoMagicLogin( undefined, undefined, false, false ) ).toBeTruthy();
		} );

		it( 'should not do magic login when disabled or when a 2fa type is defined', () => {
			config.isEnabled.mockImplementation( () => false );

			expect( canDoMagicLogin( undefined, undefined, false, false ) ).toBeFalsy();

			expect(
				canDoMagicLogin( MOCK_TWO_FACTOR_AUTH_TYPE.default, undefined, false, false )
			).toBeFalsy();
		} );

		it( 'should not do magic login while on Jetpack Cloud', () => {
			expect( canDoMagicLogin( undefined, MOCK_OAUTH_CLIENT.jetpack, false, false ) ).toBeFalsy();
		} );

		it( 'should not do magic login while Woo 2fa is enabled', () => {
			expect(
				canDoMagicLogin( undefined, MOCK_OAUTH_CLIENT.woo, MOCK_WCCOM_FROM, false )
			).toBeFalsy();
		} );

		it( 'should not do magic login if Jetpack WooCommerce Flow', () => {
			expect( canDoMagicLogin( undefined, undefined, undefined, true ) ).toBeFalsy();
		} );
	} );
} );
