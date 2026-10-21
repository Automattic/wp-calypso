/**
 * @jest-environment jsdom
 */
import { clearOauthState, isSafeReturnPath, readOauthState, saveOauthState } from '../oauth-state';

const STORAGE_KEY = 'reader.mastodon.oauthState';

describe( 'oauth-state', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
	} );

	describe( 'saveOauthState + readOauthState round-trip', () => {
		it( 'saves and reads back the state and instance', () => {
			saveOauthState( { state: 'abc', instance: 'mastodon.social' } );
			expect( readOauthState() ).toEqual( { state: 'abc', instance: 'mastodon.social' } );
		} );
	} );

	describe( 'readOauthState with malformed storage', () => {
		it( 'returns null when the key is missing', () => {
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null for non-JSON content', () => {
			window.sessionStorage.setItem( STORAGE_KEY, 'not-json' );
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null for JSON that is not an object', () => {
			window.sessionStorage.setItem( STORAGE_KEY, '"just-a-string"' );
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null for a JSON array', () => {
			window.sessionStorage.setItem( STORAGE_KEY, '[]' );
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null when state is missing', () => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( { instance: 'mastodon.social' } )
			);
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null when instance is missing', () => {
			window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { state: 'abc' } ) );
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null when state is not a string', () => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( { state: 123, instance: 'mastodon.social' } )
			);
			expect( readOauthState() ).toBeNull();
		} );

		it( 'returns null when instance is not a string', () => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( { state: 'abc', instance: 42 } )
			);
			expect( readOauthState() ).toBeNull();
		} );

		it( 'accepts objects with extra fields as long as state and instance are valid strings', () => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( { state: 'abc', instance: 'mastodon.social', extra: 'ignored' } )
			);
			// Callers only read .state and .instance; extra keys in the JSON
			// payload are harmless and need not be stripped.
			const result = readOauthState();
			expect( result?.state ).toBe( 'abc' );
			expect( result?.instance ).toBe( 'mastodon.social' );
		} );

		it( 'returns null when getItem throws', () => {
			const spy = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
				throw new Error( 'storage unavailable' );
			} );
			try {
				expect( readOauthState() ).toBeNull();
			} finally {
				spy.mockRestore();
			}
		} );
	} );

	describe( 'saveOauthState failure modes', () => {
		it( 'returns false (and does not throw) when setItem throws', () => {
			const spy = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
				throw new Error( 'QuotaExceededError' );
			} );
			try {
				expect( saveOauthState( { state: 'abc', instance: 'mastodon.social' } ) ).toBe( false );
			} finally {
				spy.mockRestore();
			}
		} );

		it( 'returns true on a successful save', () => {
			expect( saveOauthState( { state: 'abc', instance: 'mastodon.social' } ) ).toBe( true );
		} );
	} );

	describe( 'optional reconnect fields', () => {
		it( 'round-trips returnPath and reconnectingConnectionId', () => {
			saveOauthState( {
				state: 'abc',
				instance: 'mastodon.social',
				returnPath: '/reader/mastodon/42/timeline?tab=posts',
				reconnectingConnectionId: 42,
			} );
			expect( readOauthState() ).toEqual( {
				state: 'abc',
				instance: 'mastodon.social',
				returnPath: '/reader/mastodon/42/timeline?tab=posts',
				reconnectingConnectionId: 42,
			} );
		} );

		it.each( [
			[ 'protocol-relative', '//evil.example/foo' ],
			[ 'absolute https URL', 'https://evil.example/foo' ],
			[ 'non-leading-slash path', 'reader/mastodon/42' ],
			[ 'empty string', '' ],
		] )( 'drops unsafe returnPath: %s', ( _label, hostile ) => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( {
					state: 'abc',
					instance: 'mastodon.social',
					returnPath: hostile,
				} )
			);
			expect( readOauthState() ).toEqual( {
				state: 'abc',
				instance: 'mastodon.social',
			} );
		} );

		it.each( [
			[ 'NaN', NaN ],
			[ 'zero', 0 ],
			[ 'negative', -1 ],
			[ 'fractional', 1.5 ],
			[ 'string', '42' ],
		] )( 'drops invalid reconnectingConnectionId: %s', ( _label, bad ) => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( {
					state: 'abc',
					instance: 'mastodon.social',
					reconnectingConnectionId: bad,
				} )
			);
			expect( readOauthState() ).toEqual( {
				state: 'abc',
				instance: 'mastodon.social',
			} );
		} );
	} );

	describe( 'isSafeReturnPath', () => {
		it.each( [
			[ '/reader/mastodon/42/timeline', true ],
			[ '/reader/mastodon/42/timeline?tab=posts', true ],
			[ '//evil.example/foo', false ],
			[ 'https://evil.example/foo', false ],
			[ 'reader/mastodon/42', false ],
			[ '', false ],
			// Backslash-prefixed paths normalise to `//evil` in some browsers,
			// so they have to be rejected at the safety check too.
			[ '/\\evil.example/foo', false ],
			// Whitespace and control bytes never appear in legitimate Reader
			// paths (they are URL-encoded if present); raw bytes only show up
			// when the storage value has been tampered with.
			[ '/reader\nevil', false ],
			[ '/reader evil', false ],
			[ '/reader\tevil', false ],
		] )( '%s → %s', ( path, expected ) => {
			expect( isSafeReturnPath( path ) ).toBe( expected );
		} );
	} );

	describe( 'clearOauthState', () => {
		it( 'removes a previously stored state', () => {
			saveOauthState( { state: 'abc', instance: 'mastodon.social' } );
			clearOauthState();
			expect( readOauthState() ).toBeNull();
		} );

		it( 'swallows removeItem failures', () => {
			const spy = jest.spyOn( Storage.prototype, 'removeItem' ).mockImplementation( () => {
				throw new Error( 'storage unavailable' );
			} );
			try {
				expect( () => clearOauthState() ).not.toThrow();
			} finally {
				spy.mockRestore();
			}
		} );
	} );
} );
