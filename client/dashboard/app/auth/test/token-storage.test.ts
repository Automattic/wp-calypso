/**
 * @vitest-environment jsdom
 */
import store from 'store';
import { getSavedToken, markOAuthFlow, saveToken } from '../token-storage';

describe( 'token storage', () => {
	afterEach( () => {
		delete window.isSupportSession;
		store.remove( 'wpcom_token' );
		store.remove( 'wpcom_token_expires_in' );
		window.sessionStorage.clear();
	} );

	test( 'saves the token to localStorage outside a support session', () => {
		saveToken( 'token', '3600' );

		expect( store.get( 'wpcom_token' ) ).toBe( 'token' );
		expect( store.get( 'wpcom_token_expires_in' ) ).toBe( '3600' );
		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBeNull();
		expect( getSavedToken() ).toBe( 'token' );
	} );

	test( 'keeps a token obtained in a support session in the tab', () => {
		window.isSupportSession = true;

		saveToken( 'customer-token', '3600' );

		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBe( 'customer-token' );
		expect( window.sessionStorage.getItem( 'wpcom_token_expires_in' ) ).toBe( '3600' );
		expect( store.get( 'wpcom_token' ) ).toBeUndefined();
		expect( getSavedToken() ).toBe( 'customer-token' );
	} );

	test( 'keeps the token in the tab when the flow started in a support session', () => {
		window.isSupportSession = true;
		markOAuthFlow();
		delete window.isSupportSession;

		saveToken( 'customer-token' );

		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBe( 'customer-token' );
		expect( store.get( 'wpcom_token' ) ).toBeUndefined();
		expect( window.sessionStorage.getItem( 'wpcom_oauth_support_session' ) ).toBeNull();
	} );

	test( 'a flow started outside a support session clears an older mark', () => {
		window.sessionStorage.setItem( 'wpcom_oauth_support_session', '1' );

		markOAuthFlow();
		saveToken( 'token' );

		expect( store.get( 'wpcom_token' ) ).toBe( 'token' );
		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBeNull();
	} );

	test( "the user's own token still counts in a support session", () => {
		store.set( 'wpcom_token', 'own-token' );
		window.isSupportSession = true;

		expect( getSavedToken() ).toBe( 'own-token' );
	} );

	test( 'the tab token wins over the saved one in a support session', () => {
		store.set( 'wpcom_token', 'own-token' );
		window.isSupportSession = true;
		window.sessionStorage.setItem( 'wpcom_token', 'customer-token' );

		expect( getSavedToken() ).toBe( 'customer-token' );
	} );

	test( 'drops a tab token once the support session is over', () => {
		store.set( 'wpcom_token', 'own-token' );
		window.sessionStorage.setItem( 'wpcom_token', 'customer-token' );
		window.sessionStorage.setItem( 'wpcom_token_expires_in', '3600' );

		expect( getSavedToken() ).toBe( 'own-token' );
		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBeNull();
		expect( window.sessionStorage.getItem( 'wpcom_token_expires_in' ) ).toBeNull();
	} );

	test( 'drops the token in a support session when sessionStorage is unavailable', () => {
		const sessionStorage = window.sessionStorage;
		Object.defineProperty( window, 'sessionStorage', {
			configurable: true,
			get() {
				throw new Error( 'blocked' );
			},
		} );
		window.isSupportSession = true;

		try {
			expect( () => saveToken( 'customer-token' ) ).not.toThrow();
			expect( getSavedToken() ).toBeUndefined();
			expect( store.get( 'wpcom_token' ) ).toBeUndefined();
		} finally {
			Object.defineProperty( window, 'sessionStorage', {
				configurable: true,
				value: sessionStorage,
			} );
		}
	} );
} );
