/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => {
		if ( key === 'blackbox_api_key' ) {
			return 'test-api-key';
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

	test( 'loadBlackboxSdk calls loadScript with the configured URL and data-apikey', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk();

		expect( loadScript ).toHaveBeenCalledWith(
			'https://blackbox-api.wp.com/v.js',
			expect.any( Function ),
			expect.objectContaining( { 'data-apikey': 'test-api-key' } )
		);
	} );

	test( 'loadBlackboxSdk only injects the script once on repeated calls', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk();
		await loadBlackboxSdk();

		expect( loadScript ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'loadBlackboxSdk does not call configure after load', async () => {
		window.Blackbox = { configure: jest.fn(), getSessionId: jest.fn() };
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk();

		expect( window.Blackbox.configure ).not.toHaveBeenCalled();
	} );

	test( 'loadBlackboxSdk resolves even when the script fails to load', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript.mockImplementationOnce( ( _url, callback ) => callback( new Error( 'fail' ) ) );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await expect( loadBlackboxSdk() ).resolves.toBeUndefined();
	} );

	test( 'loadBlackboxSdk retries on the next call after the script fails to load', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript
			.mockImplementationOnce( ( _url, callback ) => callback( new Error( 'fail' ) ) )
			.mockImplementationOnce( ( _url, callback ) => callback( null ) );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk();
		await loadBlackboxSdk();

		expect( loadScript ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'loadBlackboxSdk resolves immediately without calling loadScript when feature flag is off', async () => {
		const config = require( '@automattic/calypso-config' );
		config.isEnabled.mockReturnValueOnce( false );
		const { loadScript } = require( '@automattic/load-script' );
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await expect( loadBlackboxSdk() ).resolves.toBeUndefined();
		expect( loadScript ).not.toHaveBeenCalled();
	} );
} );
