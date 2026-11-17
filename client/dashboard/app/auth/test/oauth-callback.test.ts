/**
 * @vitest-environment jsdom
 */
import store from 'store';
import { vi } from 'vitest';
import { handleOAuthCallback } from '../oauth-callback';

describe( 'handleOAuthCallback', () => {
	const replace = vi.fn();

	function visit( {
		pathname = '/oauth/token',
		search = '?next=%2Foverview',
		hash = '#access_token=token&expires_in=3600&state=abc',
	}: { pathname?: string; search?: string; hash?: string } = {} ) {
		Object.defineProperty( window, 'location', {
			writable: true,
			value: { pathname, search, hash, replace },
		} );
	}

	afterEach( () => {
		delete window.isSupportSession;
		store.remove( 'wpcom_token' );
		store.remove( 'wpcom_token_expires_in' );
		window.sessionStorage.clear();
		replace.mockClear();
	} );

	test( 'leaves other pages alone', () => {
		visit( { pathname: '/overview' } );

		expect( handleOAuthCallback() ).toBe( false );
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'rejects a state that does not match the one the flow stored', () => {
		window.sessionStorage.setItem( 'wpcom_oauth_state', 'other' );
		visit();

		expect( handleOAuthCallback() ).toBe( true );
		expect( store.get( 'wpcom_token' ) ).toBeUndefined();
		expect( replace ).toHaveBeenCalledWith( '/' );
	} );

	test( 'saves the token and continues to the next page', () => {
		window.sessionStorage.setItem( 'wpcom_oauth_state', 'abc' );
		visit();

		expect( handleOAuthCallback() ).toBe( true );
		expect( store.get( 'wpcom_token' ) ).toBe( 'token' );
		expect( store.get( 'wpcom_token_expires_in' ) ).toBe( '3600' );
		expect( window.sessionStorage.getItem( 'wpcom_oauth_state' ) ).toBeNull();
		expect( replace ).toHaveBeenCalledWith( '/overview' );
	} );

	test( 'keeps a token obtained in a support session in the tab', () => {
		window.sessionStorage.setItem( 'wpcom_oauth_state', 'abc' );
		window.isSupportSession = true;
		visit();

		expect( handleOAuthCallback() ).toBe( true );
		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBe( 'token' );
		expect( store.get( 'wpcom_token' ) ).toBeUndefined();
	} );

	test( 'keeps the token in the tab when the flow started in a support session', () => {
		window.sessionStorage.setItem( 'wpcom_oauth_state', 'abc' );
		window.sessionStorage.setItem( 'wpcom_oauth_support_session', '1' );
		visit();

		expect( handleOAuthCallback() ).toBe( true );
		expect( window.sessionStorage.getItem( 'wpcom_token' ) ).toBe( 'token' );
		expect( store.get( 'wpcom_token' ) ).toBeUndefined();
	} );

	test( 'sends an unsafe next page to the root', () => {
		window.sessionStorage.setItem( 'wpcom_oauth_state', 'abc' );
		visit( { search: '?next=https%3A%2F%2Fevil.example' } );

		expect( handleOAuthCallback() ).toBe( true );
		expect( replace ).toHaveBeenCalledWith( '/' );
	} );
} );
