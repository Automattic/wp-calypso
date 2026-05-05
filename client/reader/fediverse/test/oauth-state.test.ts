/**
 * @jest-environment jsdom
 */
import { clearOauthState, loadOauthState, saveOauthState } from '../oauth-state';

const STORAGE_KEY = 'reader-fediverse-oauth-state';

describe( 'oauth-state', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
	} );

	describe( 'saveOauthState + loadOauthState round-trip', () => {
		it( 'saves and loads back the state and blog_id', () => {
			saveOauthState( { state: 'abc', blog_id: 42 } );
			expect( loadOauthState() ).toEqual( { state: 'abc', blog_id: 42 } );
		} );
	} );

	describe( 'storage key verification', () => {
		it( 'uses the correct storage key', () => {
			saveOauthState( { state: 'test-state', blog_id: 123 } );
			expect( window.sessionStorage.getItem( STORAGE_KEY ) ).toBe(
				JSON.stringify( { state: 'test-state', blog_id: 123 } )
			);
		} );
	} );

	describe( 'loadOauthState with malformed storage', () => {
		it( 'returns null when the key is missing', () => {
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null for non-JSON content', () => {
			window.sessionStorage.setItem( STORAGE_KEY, 'not-json' );
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null for JSON that is not an object', () => {
			window.sessionStorage.setItem( STORAGE_KEY, '"just-a-string"' );
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null for a JSON array', () => {
			window.sessionStorage.setItem( STORAGE_KEY, '[]' );
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null when state is missing', () => {
			window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { blog_id: 42 } ) );
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null when blog_id is missing', () => {
			window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { state: 'abc' } ) );
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null when state is not a string', () => {
			window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { state: 123, blog_id: 42 } ) );
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null when blog_id is not a number', () => {
			window.sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify( { state: 'abc', blog_id: 'not-a-number' } )
			);
			expect( loadOauthState() ).toBeNull();
		} );

		it( 'returns null when getItem throws', () => {
			const spy = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
				throw new Error( 'storage unavailable' );
			} );
			try {
				expect( loadOauthState() ).toBeNull();
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
				expect( () => saveOauthState( { state: 'abc', blog_id: 42 } ) ).not.toThrow();
			} finally {
				spy.mockRestore();
			}
		} );
	} );

	describe( 'clearOauthState', () => {
		it( 'removes a previously stored state', () => {
			saveOauthState( { state: 'abc', blog_id: 42 } );
			clearOauthState();
			expect( loadOauthState() ).toBeNull();
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
