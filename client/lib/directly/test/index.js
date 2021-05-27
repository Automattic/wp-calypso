/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import nock from 'nock';

jest.mock( '@automattic/load-script', () => ( { loadScript: jest.fn() } ) );

describe( 'index', () => {
	let initialize;
	let askQuestion;
	let loadScript;

	// Helpers to simulate whether the remote Directly script loads or fails
	const simulateSuccessfulScriptLoad = () => {
		loadScript.mockImplementation( ( url, callback ) => callback() );
	};
	const simulateFailedScriptLoad = ( error ) => {
		loadScript.mockImplementation( ( url, callback ) => callback( error ) );
	};

	beforeEach( () => {
		// The previous test called `resetModules()`, so these needs to be loaded again
		( { initialize, askQuestion } = require( '../' ) );
		( { loadScript } = require( '@automattic/load-script' ) );

		// Since most tests expect the script to load, make this the default
		simulateSuccessfulScriptLoad();
	} );

	afterEach( () => {
		// After each test, clean up the globals put in place by Directly
		const script = document.querySelector( '#directlyRTMScript' );
		if ( script ) {
			script.remove();
		}
		window.DirectlyRTM = undefined;
		// We need to reset local state in directly library
		jest.resetModules();
	} );

	describe( 'when the API says Directly is available', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/help/directly/mine' )
				.reply( 200, {
					isAvailable: true,
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		describe( '#initialize()', () => {
			test( 'creates a window.DirectlyRTM function', async () => {
				await initialize();
				expect( window.DirectlyRTM ).toBeInstanceOf( Function );
			} );

			test( 'attempts to load the remote script', async () => {
				await initialize();
				expect( loadScript ).toHaveBeenCalledTimes( 1 );
			} );

			test( 'does nothing after the first call', async () => {
				await Promise.all( [ initialize(), initialize(), initialize() ] );
				expect( window.DirectlyRTM.cq ).toHaveLength( 1 );
				expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).toBe( 'config' );
				expect( loadScript ).toHaveBeenCalledTimes( 1 );
			} );

			test( 'rejects the returned promise if the library load fails', async () => {
				const error = { src: 'http://url.to/directly/embed.js' };
				simulateFailedScriptLoad( error );
				await expect( initialize() ).rejects.toThrow( error.src );
			} );
		} );

		describe( '#askQuestion()', () => {
			const questionText = 'How can I give you all my money?';
			const name = 'Richie Rich';
			const email = 'richie@richenterprises.biz';

			test( "initializes Directly if it hasn't already been initialized", async () => {
				await askQuestion( questionText, name, email );
				expect( window.DirectlyRTM ).toBeInstanceOf( Function );
				expect( loadScript ).toHaveBeenCalledTimes( 1 );
			} );

			test( 'invokes the Directly API with the given paramaters', async () => {
				window.DirectlyRTM = jest.fn();
				await askQuestion( questionText, name, email );
				expect( window.DirectlyRTM ).toHaveBeenCalledWith( 'askQuestion', {
					questionText,
					name,
					email,
				} );
			} );
		} );
	} );

	describe( 'when the public API says Directly is not available', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/help/directly/mine' )
				.reply( 200, {
					isAvailable: false,
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		describe( '#initialize()', () => {
			test( 'rejects intialization with an error', async () => {
				await expect( initialize() ).rejects.toThrow(
					'Directly Real-Time Messaging is not available at this time.'
				);
			} );

			test( 'does not attempt to load the remote script', async () => {
				await expect( initialize() ).rejects.toThrow();
				expect( loadScript ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
