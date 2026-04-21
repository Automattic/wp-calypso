/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => {
		if ( key === 'blackbox_api_key' ) {
			return 'api-key';
		}
		if ( key === 'blackbox_url' ) {
			return 'https://blackbox-api.wp.com/v.js';
		}
		return undefined;
	} );

	config.isEnabled = jest.fn( ( featureName ) => featureName === 'blackbox-login' );
	return config;
} );

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( ( _url, callback ) => {
		if ( typeof callback === 'function' ) {
			callback( null );
		}
	} ),
} ) );

describe( 'ensureBlackboxLoginScript', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.resetModules();
		jest.useFakeTimers();
		document.head.innerHTML = '';
		delete window.Blackbox;
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	test( 'loads blackbox via loadScript with data attributes', async () => {
		const { ensureBlackboxLoginScript } = require( '../ensure-blackbox-login-script' );
		const { loadScript } = require( '@automattic/load-script' );

		await ensureBlackboxLoginScript();

		expect( loadScript ).toHaveBeenCalledWith(
			'https://blackbox-api.wp.com/v.js',
			expect.any( Function ),
			expect.objectContaining( {
				'data-apikey': 'api-key',
				'data-challenge-container': '#blackbox-challenge-root',
				'data-on-challenge-start': '__calypsoBlackboxOnChallengeStart',
				'data-on-challenge-complete': '__calypsoBlackboxOnChallengeComplete',
			} )
		);
	} );

	test( 'resolves when loadScript rejects', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript.mockImplementationOnce( ( _url, callback ) => {
			callback( new Error( 'load failed' ) );
		} );
		const { ensureBlackboxLoginScript } = require( '../ensure-blackbox-login-script' );

		await expect( ensureBlackboxLoginScript() ).resolves.toBeUndefined();
	} );

	test( 'uses existing script branch without calling loadScript', async () => {
		const existing = document.createElement( 'script' );
		existing.src = 'https://blackbox-api.wp.com/v.js';
		document.head.appendChild( existing );

		const { ensureBlackboxLoginScript } = require( '../ensure-blackbox-login-script' );
		const { loadScript } = require( '@automattic/load-script' );

		const result = ensureBlackboxLoginScript();
		expect( loadScript ).not.toHaveBeenCalled();

		existing.dispatchEvent( new Event( 'load' ) );
		await expect( result ).resolves.toBeUndefined();
	} );

	test( 'times out and resolves if external script hangs', async () => {
		const { loadScript } = require( '@automattic/load-script' );
		loadScript.mockImplementationOnce( () => {} );
		const { ensureBlackboxLoginScript } = require( '../ensure-blackbox-login-script' );

		const result = ensureBlackboxLoginScript();

		jest.advanceTimersByTime( 10000 );
		await expect( result ).resolves.toBeUndefined();
	} );

	test( 'registers runtime callbacks after script load', async () => {
		window.Blackbox = {
			configure: jest.fn(),
		};
		const { ensureBlackboxLoginScript } = require( '../ensure-blackbox-login-script' );

		await ensureBlackboxLoginScript();

		expect( window.Blackbox.configure ).toHaveBeenCalledWith(
			expect.objectContaining( {
				apiKey: 'api-key',
				challengeContainer: '#blackbox-challenge-root',
			} )
		);
	} );
} );
