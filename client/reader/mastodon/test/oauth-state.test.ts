/**
 * @jest-environment jsdom
 */
import { clearOauthState, readOauthState, saveOauthState } from '../oauth-state';

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
		it( 'swallows QuotaExceededError from setItem', () => {
			const spy = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
				throw new Error( 'QuotaExceededError' );
			} );
			try {
				expect( () =>
					saveOauthState( { state: 'abc', instance: 'mastodon.social' } )
				).not.toThrow();
			} finally {
				spy.mockRestore();
			}
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
