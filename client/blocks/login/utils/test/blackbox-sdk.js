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
	config.isEnabled = jest.fn( ( flag ) => flag === 'blackbox-login' );
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

	test( 'configure() is called once after load with the full config including wrapper callbacks', async () => {
		window.Blackbox = { configure: jest.fn(), collect: jest.fn(), getSessionId: jest.fn() };
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await loadBlackboxSdk();

		expect( window.Blackbox.configure ).toHaveBeenCalledTimes( 1 );
		expect( window.Blackbox.configure ).toHaveBeenCalledWith(
			expect.objectContaining( {
				apiKey: 'test-api-key',
				challengeContainer: '#blackbox-challenge-root',
				onChallengeStart: expect.any( Function ),
				onChallengeComplete: expect.any( Function ),
			} )
		);
	} );

	test( 'wrapper callbacks delegate to challengeCallbacks slots', async () => {
		const onStart = jest.fn();
		const onComplete = jest.fn();
		window.Blackbox = { configure: jest.fn(), collect: jest.fn(), getSessionId: jest.fn() };

		const { loadBlackboxSdk, challengeCallbacks } = require( '../blackbox-sdk' );
		challengeCallbacks.onChallengeStart = onStart;
		challengeCallbacks.onChallengeComplete = onComplete;

		await loadBlackboxSdk();

		// Extract the wrappers passed to configure() and invoke them
		const [ configArg ] = window.Blackbox.configure.mock.calls[ 0 ];
		configArg.onChallengeStart();
		configArg.onChallengeComplete();

		expect( onStart ).toHaveBeenCalledTimes( 1 );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'loadBlackboxSdk resolves even when the script fails to load', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript.mockImplementationOnce( ( _url, callback ) => callback( new Error( 'fail' ) ) );
		window.Blackbox = { configure: jest.fn() };
		const { loadBlackboxSdk } = require( '../blackbox-sdk' );

		await expect( loadBlackboxSdk() ).resolves.toBeUndefined();
		expect( window.Blackbox.configure ).not.toHaveBeenCalled();
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
