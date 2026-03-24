/**
 * Tests for session utilities
 */
import { getSessionId } from './session';

// Mock localStorage
const localStorageMock = ( () => {
	let store: Record< string, string > = {};
	return {
		getItem: jest.fn( ( key: string ) => store[ key ] || null ),
		setItem: jest.fn( ( key: string, value: string ) => {
			store[ key ] = value;
		} ),
		removeItem: jest.fn( ( key: string ) => {
			delete store[ key ];
		} ),
		clear: jest.fn( () => {
			store = {};
		} ),
	};
} )();

Object.defineProperty( window, 'localStorage', {
	value: localStorageMock,
	writable: true,
} );

// Helper to reset all mocks and storage
function resetMocks() {
	localStorageMock.clear();
	jest.clearAllMocks();
	delete ( window as any ).agentsManager;
}

describe( 'Session Utilities', () => {
	beforeEach( () => {
		resetMocks();
	} );

	describe( 'getSessionId', () => {
		describe( 'agents-manager priority', () => {
			it( 'should use agents-manager session ID when available', () => {
				const mockSessionId = 'agents-manager-session-123';
				( window as any ).agentsManager = {
					getSessionId: () => mockSessionId,
				};

				const sessionId = getSessionId();

				expect( sessionId ).toBe( mockSessionId );
				expect( localStorageMock.getItem ).not.toHaveBeenCalled();
			} );

			it( 'should fall back to localStorage when agents-manager returns empty string', () => {
				( window as any ).agentsManager = {
					getSessionId: () => '',
				};

				const sessionId = getSessionId();

				expect( sessionId ).toBeTruthy();
				expect( sessionId ).not.toBe( '' );
				// Should have tried to read from localStorage
				expect( localStorageMock.getItem ).toHaveBeenCalled();
			} );

			it( 'should fall back to localStorage when agents-manager is undefined', () => {
				// No agentsManager on window
				const sessionId = getSessionId();

				expect( sessionId ).toBeTruthy();
				expect( localStorageMock.getItem ).toHaveBeenCalled();
			} );
		} );

		describe( 'localStorage session management', () => {
			it( 'should generate new session ID when localStorage is empty', () => {
				const sessionId = getSessionId();

				expect( sessionId ).toBeTruthy();
				expect( sessionId ).toMatch(
					/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
				);
				expect( localStorageMock.setItem ).toHaveBeenCalledWith(
					'image-studio-session-id',
					expect.stringContaining( sessionId )
				);
			} );

			it( 'should reuse valid session from localStorage', () => {
				const existingSessionId = 'existing-session-uuid';
				const sessionData = JSON.stringify( {
					sessionId: existingSessionId,
					timestamp: Date.now(),
				} );

				localStorageMock.getItem.mockReturnValue( sessionData );

				const sessionId = getSessionId();

				expect( sessionId ).toBe( existingSessionId );
			} );

			it( 'should generate new session when stored session is expired', () => {
				const expiredSessionId = 'expired-session-uuid';
				const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
				const sessionData = JSON.stringify( {
					sessionId: expiredSessionId,
					timestamp: expiredTimestamp,
				} );

				localStorageMock.getItem.mockReturnValue( sessionData );

				const sessionId = getSessionId();

				expect( sessionId ).not.toBe( expiredSessionId );
				expect( localStorageMock.removeItem ).toHaveBeenCalledWith( 'image-studio-session-id' );
			} );

			it( 'should persist new session to localStorage', () => {
				getSessionId();

				expect( localStorageMock.setItem ).toHaveBeenCalledWith(
					'image-studio-session-id',
					expect.any( String )
				);

				const setItemCall = localStorageMock.setItem.mock.calls[ 0 ];
				const storedData = JSON.parse( setItemCall[ 1 ] );

				expect( storedData ).toHaveProperty( 'sessionId' );
				expect( storedData ).toHaveProperty( 'timestamp' );
				expect( typeof storedData.sessionId ).toBe( 'string' );
				expect( typeof storedData.timestamp ).toBe( 'number' );
			} );
		} );

		describe( 'error handling', () => {
			it( 'should handle localStorage.getItem throwing error', () => {
				localStorageMock.getItem.mockImplementation( () => {
					throw new Error( 'localStorage disabled' );
				} );

				const sessionId = getSessionId();

				// Should still generate a valid session ID
				expect( sessionId ).toBeTruthy();
				expect( sessionId ).toMatch( /^[0-9a-f-]+$/ );
			} );

			it( 'should handle localStorage.setItem throwing error', () => {
				localStorageMock.setItem.mockImplementation( () => {
					throw new Error( 'localStorage full' );
				} );

				const sessionId = getSessionId();

				// Should still return a valid session ID even if storage fails
				expect( sessionId ).toBeTruthy();
			} );

			it( 'should handle corrupted JSON in localStorage', () => {
				localStorageMock.getItem.mockReturnValue( 'invalid-json{' );

				const sessionId = getSessionId();

				// Should generate new session ID
				expect( sessionId ).toBeTruthy();
			} );

			it( 'should handle malformed session data structure', () => {
				const malformedData = JSON.stringify( {
					wrongKey: 'value',
				} );

				localStorageMock.getItem.mockReturnValue( malformedData );

				const sessionId = getSessionId();

				// Should generate new session ID
				expect( sessionId ).toBeTruthy();
			} );
		} );

		describe( 'UUID generation', () => {
			it( 'should generate valid UUID v4 format', () => {
				const sessionId = getSessionId();

				// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
				// where y is one of [8, 9, a, b]
				const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				expect( sessionId ).toMatch( uuidRegex );
			} );

			it( 'should generate unique session IDs', () => {
				resetMocks();

				const sessionIds = new Set< string >();
				for ( let i = 0; i < 10; i++ ) {
					resetMocks();
					sessionIds.add( getSessionId() );
				}

				// All 10 should be unique
				expect( sessionIds.size ).toBe( 10 );
			} );
		} );

		describe( 'session expiry', () => {
			it( 'should consider session valid when within 24 hours', () => {
				const recentSessionId = 'recent-session-uuid';
				const recentTimestamp = Date.now() - 23 * 60 * 60 * 1000; // 23 hours ago
				const sessionData = JSON.stringify( {
					sessionId: recentSessionId,
					timestamp: recentTimestamp,
				} );

				localStorageMock.getItem.mockReturnValue( sessionData );

				const sessionId = getSessionId();

				expect( sessionId ).toBe( recentSessionId );
			} );

			it( 'should consider session expired after 24 hours', () => {
				const oldSessionId = 'old-session-uuid';
				const oldTimestamp = Date.now() - 24 * 60 * 60 * 1000 - 1000; // Just over 24 hours
				const sessionData = JSON.stringify( {
					sessionId: oldSessionId,
					timestamp: oldTimestamp,
				} );

				localStorageMock.getItem.mockReturnValue( sessionData );

				const sessionId = getSessionId();

				expect( sessionId ).not.toBe( oldSessionId );
			} );
		} );
	} );
} );
