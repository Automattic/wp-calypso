/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/load-script', () => ( { loadScript: jest.fn() } ) );
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn( () => Promise.resolve( { isAvailable: false } ) ),
} ) );
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn( true ),
	__esModule: true,
	default( key ) {
		return key;
	},
} ) );

describe( 'index', () => {
	let initializeDirectly;
	let checkAPIThenInitializeDirectly;
	let askDirectlyQuestion;
	let loadScript;

	const simulateSuccessfulScriptLoad = () => {
		loadScript.mockImplementation( () => Promise.resolve() );
	};
	const simulateFailedScriptLoad = ( error ) => {
		loadScript.mockImplementation( () => Promise.reject( new Error( error.src ) ) );
	};

	beforeEach( () => {
		// The previous test called `resetModules()`, so these needs to be loaded again
		( {
			initializeDirectly,
			askDirectlyQuestion,
			checkAPIThenInitializeDirectly,
		} = require( '../' ) );
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

	describe( '#initializeDirectly()', () => {
		test( 'creates a window.DirectlyRTM function', async () => {
			await initializeDirectly();
			expect( window.DirectlyRTM ).toBeInstanceOf( Function );
		} );

		test( 'attempts to load the remote script', async () => {
			await initializeDirectly();
			expect( loadScript ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'does nothing after the first call', async () => {
			await Promise.all( [ initializeDirectly(), initializeDirectly(), initializeDirectly() ] );
			expect( window.DirectlyRTM.cq ).toHaveLength( 1 );
			expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).toBe( 'config' );
			expect( loadScript ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'rejects the returned promise if the library load fails', async () => {
			const error = { src: 'http://url.to/directly/embed.js' };
			simulateFailedScriptLoad( error );
			await expect( initializeDirectly() ).rejects.toThrow( error.src );
		} );
	} );

	describe( '#askDirectlyQuestion()', () => {
		const questionText = 'How can I give you all my money?';
		const name = 'Richie Rich';
		const email = 'richie@richenterprises.biz';

		test( "initializes Directly if it hasn't already been initialized", async () => {
			await askDirectlyQuestion( questionText, name, email );
			expect( window.DirectlyRTM ).toBeInstanceOf( Function );
			expect( loadScript ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'invokes the Directly API with the given paramaters', async () => {
			window.DirectlyRTM = jest.fn();
			await askDirectlyQuestion( questionText, name, email );
			expect( window.DirectlyRTM ).toHaveBeenCalledWith( 'askQuestion', {
				questionText,
				name,
				email,
			} );
		} );
	} );

	describe( 'when the public API says Directly is not available', () => {
		describe( '#checkAPIThenInitializeDirectly()', () => {
			test( 'rejects intialization with an error', async () => {
				await expect( checkAPIThenInitializeDirectly() ).rejects.toThrow(
					'Directly Real-Time Messaging is not available at this time.'
				);
			} );

			test( 'does not attempt to load the remote script', async () => {
				await expect( checkAPIThenInitializeDirectly() ).rejects.toThrow();
				expect( loadScript ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
