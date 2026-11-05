/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => {
		if ( key === 'blackbox_api_key' ) {
			return 'login-key';
		}
		if ( key === 'blackbox_signup_api_key' ) {
			return 'signup-key';
		}
		if ( key === 'blackbox_url' ) {
			return 'https://blackbox-api.wp.com/v.js';
		}
		return undefined;
	} );
	config.isEnabled = jest.fn( ( flag ) => flag === 'blackbox' );
	return config;
} );

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( ( _url, callback ) => {
		if ( typeof callback === 'function' ) {
			callback( null );
		}
	} ),
} ) );

describe( 'blackbox-sdk', () => {
	beforeEach( () => {
		jest.resetModules();
		jest.clearAllMocks();
		delete window.Blackbox;
	} );

	test( 'getBlackboxKey pairs the login key with key version 2', () => {
		const { getBlackboxKey } = require( '../blackbox-sdk' );

		expect( getBlackboxKey() ).toEqual( { apiKey: 'login-key', keyVersion: 2 } );
	} );

	test( 'getBlackboxKey sends no key version with the legacy signup key', () => {
		const { getBlackboxKey } = require( '../blackbox-sdk' );

		expect( getBlackboxKey( { legacySignupKey: true } ) ).toEqual( {
			apiKey: 'signup-key',
			keyVersion: undefined,
		} );
	} );

	test( 'getBlackboxSignupFields sends the key version with the session ID', () => {
		const { getBlackboxSignupFields } = require( '../blackbox-sdk' );

		expect( getBlackboxSignupFields( 'abc123', 2 ) ).toEqual( {
			blackbox_session_id: 'abc123',
			blackbox_key_version: 2,
		} );
		expect( getBlackboxSignupFields( 'abc123', undefined ) ).toEqual( {
			blackbox_session_id: 'abc123',
		} );
	} );

	test( 'getBlackboxSignupFields sends nothing without a session', () => {
		const { getBlackboxSignupFields } = require( '../blackbox-sdk' );

		expect( getBlackboxSignupFields( undefined, 2 ) ).toEqual( {} );
	} );

	test( 'loadBlackboxSdk injects the api key it was given', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk( 'signup-key' );

		expect( loadScript ).toHaveBeenCalledWith(
			'https://blackbox-api.wp.com/v.js',
			expect.any( Function ),
			expect.objectContaining( { 'data-apikey': 'signup-key' } )
		);
	} );

	test( 'loadBlackboxSdk only injects the script once on repeated calls', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk( 'login-key' );
		await loadBlackboxSdk( 'login-key' );

		expect( loadScript ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'loadBlackboxSdk does not call configure after load', async () => {
		window.Blackbox = { configure: jest.fn(), getSessionId: jest.fn() };
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk( 'login-key' );

		expect( window.Blackbox.configure ).not.toHaveBeenCalled();
	} );

	test( 'loadBlackboxSdk resolves even when the script fails to load', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript.mockImplementationOnce( ( _url, callback ) => callback( new Error( 'fail' ) ) );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await expect( loadBlackboxSdk( 'login-key' ) ).resolves.toBeUndefined();
	} );

	test( 'loadBlackboxSdk retries on the next call after the script fails to load', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript
			.mockImplementationOnce( ( _url, callback ) => callback( new Error( 'fail' ) ) )
			.mockImplementationOnce( ( _url, callback ) => callback( null ) );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk( 'login-key' );
		await loadBlackboxSdk( 'login-key' );

		expect( loadScript ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'loadBlackboxSdk resolves immediately without calling loadScript when feature flag is off', async () => {
		const config = require( '@automattic/calypso-config' );
		config.isEnabled.mockReturnValueOnce( false );
		const { loadScript } = require( '@automattic/load-script' );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await expect( loadBlackboxSdk( 'login-key' ) ).resolves.toBeUndefined();
		expect( loadScript ).not.toHaveBeenCalled();
	} );
} );
