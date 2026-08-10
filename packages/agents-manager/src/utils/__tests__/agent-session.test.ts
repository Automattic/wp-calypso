/**
 * @jest-environment jsdom
 */
import {
	SESSION_STORAGE_KEY,
	setSessionSiteKey,
	getSessionId,
	saveSessionId,
	clearSessionId,
	getOrCreateSessionId,
} from '../agent-session';

// Sessions for the `ORCHESTRATOR_AGENT_ID` agent ('wp-orchestrator') use the
// unsuffixed base key. Reference it here so tests don't hard-code the mapping silently.
const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';

// jsdom's `crypto` object does not expose `randomUUID`. Polyfill it so spyOn
// can find the property, matching the behaviour of real browser environments.
function ensureCryptoRandomUUID() {
	if ( typeof globalThis.crypto.randomUUID !== 'function' ) {
		( globalThis.crypto as Crypto ).randomUUID = () =>
			'00000000-0000-4000-8000-000000000000' as ReturnType< Crypto[ 'randomUUID' ] >;
	}
}

beforeEach( () => {
	sessionStorage.clear();
	setSessionSiteKey( 'no-site' );
} );

afterEach( () => {
	jest.restoreAllMocks();
} );

describe( 'saveSessionId / getSessionId', () => {
	it( 'round-trips a session ID', () => {
		saveSessionId( 'session-abc' );

		expect( getSessionId() ).toBe( 'session-abc' );
		expect( sessionStorage.getItem( `${ SESSION_STORAGE_KEY }-no-site` ) ).toBe( 'session-abc' );
	} );

	it( 'returns empty string when nothing is stored', () => {
		expect( getSessionId() ).toBe( '' );
	} );

	it( 'uses the base key for the orchestrator agent', () => {
		saveSessionId( 'session-abc', ORCHESTRATOR_AGENT_ID );

		expect( getSessionId() ).toBe( 'session-abc' );
	} );

	it( 'scopes sessions per agent', () => {
		saveSessionId( 'orchestrator-session' );
		saveSessionId( 'reader-session', 'reader-chat' );

		expect( getSessionId() ).toBe( 'orchestrator-session' );
		expect( getSessionId( 'reader-chat' ) ).toBe( 'reader-session' );
		expect( sessionStorage.getItem( `${ SESSION_STORAGE_KEY }-reader-chat-no-site` ) ).toBe(
			'reader-session'
		);
	} );

	it( 'degrades gracefully when sessionStorage is unavailable', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const throwBlocked = () => {
			throw new Error( 'blocked' );
		};
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( throwBlocked );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( throwBlocked );
		jest.spyOn( Storage.prototype, 'removeItem' ).mockImplementation( throwBlocked );

		expect( getSessionId() ).toBe( '' );
		expect( () => saveSessionId( 'session-abc' ) ).not.toThrow();
		expect( () => clearSessionId() ).not.toThrow();
		expect( consoleError ).toHaveBeenCalledTimes( 3 );

		// A stable '' instead of a fresh UUID per call, so the agent is not
		// re-initialized on every render.
		expect( getOrCreateSessionId( 'reader-chat' ) ).toBe( '' );
	} );

	it( 'writes under an explicit site scope when one is passed', () => {
		saveSessionId( 'session-abc', undefined, '111' );

		expect( getSessionId() ).toBe( '' );

		setSessionSiteKey( '111' );
		expect( getSessionId() ).toBe( 'session-abc' );
	} );

	it( 'scopes sessions per site', () => {
		setSessionSiteKey( '123' );
		saveSessionId( 'site-123-session' );

		setSessionSiteKey( '456' );
		expect( getSessionId() ).toBe( '' );

		setSessionSiteKey( '123' );
		expect( getSessionId() ).toBe( 'site-123-session' );
	} );
} );

describe( 'clearSessionId', () => {
	it( 'removes only the current scope’s session', () => {
		saveSessionId( 'orchestrator-session' );
		saveSessionId( 'reader-session', 'reader-chat' );

		clearSessionId();

		expect( getSessionId() ).toBe( '' );
		expect( getSessionId( 'reader-chat' ) ).toBe( 'reader-session' );
	} );
} );

describe( 'getOrCreateSessionId', () => {
	beforeEach( () => {
		ensureCryptoRandomUUID();
	} );

	it( 'returns an existing session without creating a new one', () => {
		saveSessionId( 'existing-session-id', 'reader-chat' );

		expect( getOrCreateSessionId( 'reader-chat' ) ).toBe( 'existing-session-id' );
	} );

	it( 'creates and persists a new UUID when no session exists', () => {
		const mockUUID = 'crypto-uuid-5678';
		jest
			.spyOn( globalThis.crypto, 'randomUUID' )
			.mockReturnValue( mockUUID as ReturnType< Crypto[ 'randomUUID' ] > );

		expect( getOrCreateSessionId( 'reader-chat' ) ).toBe( mockUUID );
		expect( getSessionId( 'reader-chat' ) ).toBe( mockUUID );
	} );

	it( 'uses the UUID fallback pattern when crypto.randomUUID is unavailable', () => {
		const savedRandomUUID = globalThis.crypto.randomUUID;
		// @ts-expect-error - Simulating missing randomUUID
		delete globalThis.crypto.randomUUID;

		expect( getOrCreateSessionId( 'reader-chat' ) ).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
		);

		globalThis.crypto.randomUUID = savedRandomUUID;
	} );
} );
