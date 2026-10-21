/**
 * @jest-environment jsdom
 */
import { createBlackboxInstance } from '../__mocks__/blackbox-instance';
import { loadBlackboxSdk } from '../blackbox-sdk';
import { getBlackboxSessionId } from '../get-blackbox-session-id';

jest.mock( '../blackbox-sdk', () => ( {
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

const tick = async () => {
	for ( let i = 0; i < 20; i++ ) {
		await Promise.resolve();
	}
};

describe( 'getBlackboxSessionId', () => {
	let sdk;
	beforeEach( () => {
		jest.useFakeTimers();
		loadBlackboxSdk.mockReset().mockResolvedValue( undefined );
		sdk = createBlackboxInstance();
		window.Blackbox = sdk.api;
	} );
	afterEach( () => {
		delete window.Blackbox;
		jest.useRealTimers();
	} );

	test( 'flushes before returning an ID and releases its subscription', async () => {
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBe( 'sid' );
		expect( sdk.api.flush ).toHaveBeenCalledWith( { deadlineMs: 5000 } );
		expect( sdk.listeners.size ).toBe( 0 );
	} );

	test.each( [ 'timeout', 'error' ] )( 'retains a valid ID after %s', async ( outcome ) => {
		sdk.api.flush.mockResolvedValue( { sessionId: 'sid', challengePending: false, outcome } );
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBe( 'sid' );
	} );

	test( 'continues without an ID when collection fails without a session', async () => {
		sdk.setState( { status: 'loading' } );
		sdk.api.flush.mockResolvedValue( { sessionId: '', challengePending: false, outcome: 'error' } );
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBeUndefined();
	} );

	test( 'continues without an ID when the SDK is unavailable', async () => {
		delete window.Blackbox;
		await expect( getBlackboxSessionId( 'login-key' ) ).resolves.toBeUndefined();
	} );

	test( 'bounds script loading and clears the timer', async () => {
		delete window.Blackbox;
		loadBlackboxSdk.mockReturnValue( new Promise( () => {} ) );
		const result = getBlackboxSessionId( 'login-key' );
		await jest.advanceTimersByTimeAsync( 5000 );
		await expect( result ).resolves.toBeUndefined();
		expect( jest.getTimerCount() ).toBe( 0 );
	} );

	test( 'waits for a challenge without limiting user interaction time', async () => {
		sdk.api.flush.mockImplementation( async () => {
			expect( sdk.listeners.size ).toBeGreaterThan( 0 );
			sdk.setState( { status: 'challenge', sessionId: 'sid' } );
			return { sessionId: 'sid', challengePending: true, outcome: 'ok' };
		} );
		const submitted = jest.fn();
		const result = getBlackboxSessionId( 'login-key' ).then( submitted );
		await jest.advanceTimersByTimeAsync( 60000 );
		expect( submitted ).not.toHaveBeenCalled();
		sdk.setState( { status: 'ready', sessionId: 'sid' } );
		await result;
		expect( submitted ).toHaveBeenCalledWith( 'sid' );
	} );

	test( 'returns the current ID after a challenge replaces the session', async () => {
		sdk.setState( { status: 'challenge', sessionId: 'old' } );
		const result = getBlackboxSessionId( 'login-key' );
		await tick();
		sdk.setState( { status: 'ready', sessionId: 'replacement' } );
		await expect( result ).resolves.toBe( 'replacement' );
	} );

	test( 'flushes a replacement when a challenge session expires', async () => {
		sdk.setState( { status: 'challenge', sessionId: 'old' } );
		const result = getBlackboxSessionId( 'login-key' );
		await tick();
		sdk.api.flush.mockImplementationOnce( async () => {
			sdk.setState( { status: 'ready', sessionId: 'replacement' } );
			return { sessionId: 'replacement', challengePending: false, outcome: 'ok' };
		} );
		sdk.setState( { status: 'loading' } );
		await expect( result ).resolves.toBe( 'replacement' );
	} );

	test.each( [ 'loading', 'flush', 'challenge' ] )(
		'cancels during %s without releasing a request',
		async ( status ) => {
			const controller = new AbortController();
			if ( status === 'loading' ) {
				loadBlackboxSdk.mockReturnValue( new Promise( () => {} ) );
			} else if ( status === 'flush' ) {
				sdk.api.flush.mockReturnValue( new Promise( () => {} ) );
			} else {
				sdk.setState( { status, sessionId: 'sid' } );
			}
			const result = getBlackboxSessionId( 'login-key', controller.signal );
			await tick();
			controller.abort();
			await expect( result ).resolves.toBeNull();
			expect( sdk.listeners.size ).toBe( 0 );
			expect( jest.getTimerCount() ).toBe( 0 );
		}
	);
} );
