/**
 * @jest-environment jsdom
 */
import {
	SESSION_STORAGE_KEY,
	getSessionStorageKey,
	getSessionId,
	clearSessionId,
	isFreshSession,
	markSessionUsed,
	getOrCreateSessionId,
} from '../agent-session';

// The ORCHESTRATOR_AGENT_ID constant ('wp-orchestrator') is used internally in
// getSessionStorageKey to fall back to the base key. Reference it via the same
// module so tests don't hard-code the string.
const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStoredSession( sessionId: string, ageMs = 0 ) {
	return JSON.stringify( { sessionId, timestamp: Date.now() - ageMs } );
}

// jsdom's `crypto` object does not expose `randomUUID`. Polyfill it so spyOn
// can find the property, matching the behaviour of real browser environments.
function ensureCryptoRandomUUID() {
	if ( typeof globalThis.crypto.randomUUID !== 'function' ) {
		( globalThis.crypto as Crypto ).randomUUID = () =>
			'00000000-0000-4000-8000-000000000000' as ReturnType< Crypto[ 'randomUUID' ] >;
	}
}

// ---------------------------------------------------------------------------

describe( 'getSessionStorageKey', () => {
	it( 'returns base key when agentId is undefined', () => {
		expect( getSessionStorageKey( undefined ) ).toBe( SESSION_STORAGE_KEY );
	} );

	it( 'returns base key for the orchestrator agent', () => {
		expect( getSessionStorageKey( ORCHESTRATOR_AGENT_ID ) ).toBe( SESSION_STORAGE_KEY );
	} );

	it( "returns suffixed key for 'reader-chat'", () => {
		expect( getSessionStorageKey( 'reader-chat' ) ).toBe( `${ SESSION_STORAGE_KEY }-reader-chat` );
	} );

	it( "returns suffixed key for 'p2-reader-chat'", () => {
		expect( getSessionStorageKey( 'p2-reader-chat' ) ).toBe(
			`${ SESSION_STORAGE_KEY }-p2-reader-chat`
		);
	} );
} );

// ---------------------------------------------------------------------------

describe( 'getSessionId', () => {
	let getItemSpy: jest.SpyInstance;
	let removeItemSpy: jest.SpyInstance;

	beforeEach( () => {
		getItemSpy = jest.spyOn( Storage.prototype, 'getItem' ).mockReturnValue( null );
		removeItemSpy = jest.spyOn( Storage.prototype, 'removeItem' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns empty string when nothing is in localStorage', () => {
		expect( getSessionId() ).toBe( '' );
	} );

	it( 'returns stored session ID when the session is within 24 h', () => {
		getItemSpy.mockReturnValue( makeStoredSession( 'session-abc', 0 ) );
		expect( getSessionId() ).toBe( 'session-abc' );
	} );

	it( 'returns empty string and removes the key when the session is expired (> 24 h)', () => {
		const TWENTY_FIVE_HOURS = 25 * 60 * 60 * 1000;
		getItemSpy.mockReturnValue( makeStoredSession( 'old-session', TWENTY_FIVE_HOURS ) );

		expect( getSessionId() ).toBe( '' );
		expect( removeItemSpy ).toHaveBeenCalledWith( SESSION_STORAGE_KEY );
	} );

	it( 'returns empty string gracefully when localStorage value is malformed JSON', () => {
		getItemSpy.mockReturnValue( 'not-valid-json' );
		// The implementation logs a console.error — suppress it to keep test output clean.
		const consoleSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		expect( getSessionId() ).toBe( '' );
		consoleSpy.mockRestore();
	} );
} );

// ---------------------------------------------------------------------------

describe( 'clearSessionId', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'removes the session key from localStorage', () => {
		const removeItemSpy = jest
			.spyOn( Storage.prototype, 'removeItem' )
			.mockImplementation( () => {} );

		clearSessionId( 'reader-chat' );

		expect( removeItemSpy ).toHaveBeenCalledWith( `${ SESSION_STORAGE_KEY }-reader-chat` );
	} );

	it( 'removes the base session key when no agentId is provided', () => {
		const removeItemSpy = jest
			.spyOn( Storage.prototype, 'removeItem' )
			.mockImplementation( () => {} );

		clearSessionId();

		expect( removeItemSpy ).toHaveBeenCalledWith( SESSION_STORAGE_KEY );
	} );
} );

// ---------------------------------------------------------------------------

describe( 'isFreshSession', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns `false` by default (no fresh flag stored)', () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockReturnValue( null );
		expect( isFreshSession() ).toBe( false );
	} );

	it( "returns `true` when the fresh flag is set for 'reader-chat'", () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( ( key ) => {
			if ( key === 'agents-manager-session-fresh-reader-chat' ) {
				return '1';
			}
			return null;
		} );
		expect( isFreshSession( 'reader-chat' ) ).toBe( true );
	} );

	it( 'returns `false` when the fresh flag is not set for the given agentId', () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockReturnValue( null );
		expect( isFreshSession( 'reader-chat' ) ).toBe( false );
	} );
} );

// ---------------------------------------------------------------------------

describe( 'markSessionUsed', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'removes the fresh-session flag from localStorage', () => {
		const removeItemSpy = jest
			.spyOn( Storage.prototype, 'removeItem' )
			.mockImplementation( () => {} );

		markSessionUsed( 'reader-chat' );

		expect( removeItemSpy ).toHaveBeenCalledWith( 'agents-manager-session-fresh-reader-chat' );
	} );

	it( 'clears the default flag when no agentId is provided', () => {
		const removeItemSpy = jest
			.spyOn( Storage.prototype, 'removeItem' )
			.mockImplementation( () => {} );

		markSessionUsed();

		expect( removeItemSpy ).toHaveBeenCalledWith( 'agents-manager-session-fresh-default' );
	} );
} );

// ---------------------------------------------------------------------------

describe( 'getOrCreateSessionId', () => {
	let getItemSpy: jest.SpyInstance;
	let setItemSpy: jest.SpyInstance;
	let removeItemSpy: jest.SpyInstance;

	beforeEach( () => {
		ensureCryptoRandomUUID();
		getItemSpy = jest.spyOn( Storage.prototype, 'getItem' ).mockReturnValue( null );
		setItemSpy = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {} );
		removeItemSpy = jest.spyOn( Storage.prototype, 'removeItem' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'returns an existing valid session without creating a new one', () => {
		getItemSpy.mockImplementation( ( key ) => {
			if ( key === `${ SESSION_STORAGE_KEY }-reader-chat` ) {
				return makeStoredSession( 'existing-session-id', 0 );
			}
			return null;
		} );

		const result = getOrCreateSessionId( false, 'reader-chat' );

		expect( result ).toBe( 'existing-session-id' );
		expect( setItemSpy ).not.toHaveBeenCalled();
	} );

	it( 'clears existing session and generates a new UUID when isNewChat is true', () => {
		const mockUUID = 'new-uuid-1234';
		const randomUUIDSpy = jest
			.spyOn( globalThis.crypto, 'randomUUID' )
			.mockReturnValue( mockUUID as ReturnType< Crypto[ 'randomUUID' ] > );

		const result = getOrCreateSessionId( true, 'reader-chat' );

		// Should have cleared the old key first.
		expect( removeItemSpy ).toHaveBeenCalledWith( `${ SESSION_STORAGE_KEY }-reader-chat` );
		expect( result ).toBe( mockUUID );
		randomUUIDSpy.mockRestore();
	} );

	it( 'generates a new UUID with crypto.randomUUID when no stored session exists', () => {
		const mockUUID = 'crypto-uuid-5678';
		const randomUUIDSpy = jest
			.spyOn( globalThis.crypto, 'randomUUID' )
			.mockReturnValue( mockUUID as ReturnType< Crypto[ 'randomUUID' ] > );

		const result = getOrCreateSessionId( false, 'reader-chat' );

		expect( result ).toBe( mockUUID );
		// Should persist the new session and set the fresh flag.
		expect( setItemSpy ).toHaveBeenCalledWith(
			`${ SESSION_STORAGE_KEY }-reader-chat`,
			expect.stringContaining( mockUUID )
		);
		expect( setItemSpy ).toHaveBeenCalledWith( 'agents-manager-session-fresh-reader-chat', '1' );
		randomUUIDSpy.mockRestore();
	} );

	it( 'sets fresh flag when generating a new session', () => {
		const mockUUID = 'fresh-uuid-9999';
		const randomUUIDSpy = jest
			.spyOn( globalThis.crypto, 'randomUUID' )
			.mockReturnValue( mockUUID as ReturnType< Crypto[ 'randomUUID' ] > );

		getOrCreateSessionId( false );

		expect( setItemSpy ).toHaveBeenCalledWith( 'agents-manager-session-fresh-default', '1' );
		randomUUIDSpy.mockRestore();
	} );

	it( 'uses xxx-xxxx fallback pattern when crypto.randomUUID is unavailable', () => {
		// Temporarily remove randomUUID to simulate older browsers.
		const savedRandomUUID = globalThis.crypto.randomUUID;
		// @ts-expect-error - Simulating missing randomUUID
		delete globalThis.crypto.randomUUID;

		const result = getOrCreateSessionId( false, 'reader-chat' );

		// The fallback produces a string matching the xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx pattern.
		expect( result ).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
		);

		globalThis.crypto.randomUUID = savedRandomUUID;
	} );
} );
