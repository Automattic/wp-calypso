/**
 * @jest-environment jsdom
 */

jest.mock( '../blackbox-sdk', () => ( {
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

import { loadBlackboxSdk } from '../blackbox-sdk';
import { setChallengeRunning } from '../challenge-gate';
import { getBlackboxSessionId } from '../get-blackbox-session-id';

const flushMicrotasks = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'getBlackboxSessionId', () => {
	afterEach( () => {
		// The gate is module state, so an open one would hang the next test.
		setChallengeRunning( false );
		delete window.Blackbox;
		jest.clearAllMocks();
	} );

	test( 'awaits loadBlackboxSdk before calling collect', async () => {
		window.Blackbox = { collect: jest.fn( () => Promise.resolve( { sessionId: 'sid' } ) ) };

		await getBlackboxSessionId( 'login-key' );

		expect( loadBlackboxSdk ).toHaveBeenCalledWith( 'login-key' );
		expect( window.Blackbox.collect ).toHaveBeenCalled();
	} );

	test( 'loads the SDK with the api key it was given', async () => {
		window.Blackbox = { collect: jest.fn( () => Promise.resolve( 'abc123' ) ) };

		await getBlackboxSessionId( 'signup-key' );

		expect( loadBlackboxSdk ).toHaveBeenCalledWith( 'signup-key' );
	} );

	test( 'returns session id when collect resolves a string', async () => {
		window.Blackbox = { collect: jest.fn( () => Promise.resolve( 'abc123' ) ) };
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBe( 'abc123' );
	} );

	test( 'returns session id when collect resolves { sessionId }', async () => {
		window.Blackbox = {
			collect: jest.fn( () => Promise.resolve( { sessionId: 'def456' } ) ),
		};
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBe( 'def456' );
	} );

	test( 'returns undefined when Blackbox is not loaded', async () => {
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBeUndefined();
	} );

	test( 'returns undefined when collect is not a function', async () => {
		window.Blackbox = {};
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBeUndefined();
	} );

	test( 'returns undefined when collect throws', async () => {
		window.Blackbox = { collect: jest.fn( () => Promise.reject( new Error( 'boom' ) ) ) };
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBeUndefined();
	} );

	test( 'withholds the session until a challenge raised by its own collect settles', async () => {
		window.Blackbox = {
			collect: jest.fn( async () => {
				setChallengeRunning( true );
				return 'sid';
			} ),
		};

		let sessionId;
		const pending = getBlackboxSessionId( 'login-key' ).then( ( id ) => {
			sessionId = id;
		} );

		await flushMicrotasks();
		expect( sessionId ).toBeUndefined();

		setChallengeRunning( false );
		await pending;

		expect( sessionId ).toBe( 'sid' );
	} );
} );
