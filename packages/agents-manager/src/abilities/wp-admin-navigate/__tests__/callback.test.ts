/**
 * @jest-environment jsdom
 */
jest.mock( '../../../utils/agent-session', () => ( {
	getActiveSessionId: jest.fn( () => 'tab-session' ),
} ) );

import {
	completePendingNavigation,
	markContinuationSent,
	NAVIGATION_PENDING_EVENT,
} from '../../../utils/wp-admin-navigation-state';
import { wpAdminNavigateCallback } from '../callback';

const STORAGE_KEY = 'agents-manager-pending-navigation';

function storedState() {
	return JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? 'null' );
}

beforeEach( () => {
	jest.useFakeTimers();
	sessionStorage.clear();
	// A writable stub, so the redirect assignment does not hit jsdom's
	// unimplemented navigation.
	Reflect.deleteProperty( window, 'location' );
	( window as { location: unknown } ).location = {
		origin: 'https://example.wordpress.com',
		href: 'https://example.wordpress.com/wp-admin/index.php',
		pathname: '/wp-admin/index.php',
		search: '',
		reload: jest.fn(),
	};
} );

afterEach( () => {
	jest.useRealTimers();
	jest.restoreAllMocks();
} );

describe( 'wpAdminNavigateCallback', () => {
	it( 'stores the resume state right away and redirects after the delay', async () => {
		const result = await wpAdminNavigateCallback( {
			path: '/wp-admin/plugins.php',
			toolCallId: 'call-1',
			toolId: 'wp_admin__navigate',
		} );

		expect( result ).toMatchObject( {
			result: { success: true, message: 'Taking you to /wp-admin/plugins.php…' },
			returnToAgent: false,
		} );
		// Saved before the delay — the call stays answerable even if the user
		// leaves the page before the redirect fires.
		expect( storedState() ).toMatchObject( {
			destination: '/wp-admin/plugins.php',
			sessionId: 'tab-session',
			toolCallId: 'call-1',
			toolId: 'wp_admin__navigate',
		} );
		expect( window.location.href ).not.toBe( '/wp-admin/plugins.php' );

		jest.advanceTimersByTime( 1000 );
		expect( window.location.href ).toBe( '/wp-admin/plugins.php' );
	} );

	it( 'normalizes the destination, keeping the query and dropping the hash', async () => {
		const result = await wpAdminNavigateCallback( {
			path: '/wp-admin/./edit.php?post_type=page#top',
		} );
		jest.advanceTimersByTime( 1000 );

		expect( result.result.success ).toBe( true );
		expect( storedState().destination ).toBe( '/wp-admin/edit.php?post_type=page' );
		expect( result.result.message ).toContain( '/wp-admin/edit.php?post_type=page' );
	} );

	it.each( [
		[ 'a missing path', {} ],
		[ 'a non-admin path', { path: '/some-page' } ],
		[ 'a dot-segment escape', { path: '/wp-admin/../wp-login.php' } ],
		[ 'a percent-encoded escape', { path: '/wp-admin/%2e%2e/wp-login.php' } ],
		[ 'an encoded-slash escape', { path: '/wp-admin/..%2fwp-login.php' } ],
		[ 'an absolute external URL', { path: 'https://evil.example/wp-admin/plugins.php' } ],
	] )( 'refuses %s without storing state', async ( _case, input ) => {
		const result = await wpAdminNavigateCallback( input );

		expect( result.result.success ).toBe( false );
		expect( sessionStorage.getItem( STORAGE_KEY ) ).toBeNull();
		expect( jest.getTimerCount() ).toBe( 0 );
	} );

	it( 'refuses to navigate when storing the state fails — no page could answer the call', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'quota exceeded' );
		} );

		const result = await wpAdminNavigateCallback( { path: '/wp-admin/plugins.php' } );

		expect( result.result.success ).toBe( false );
		expect( jest.getTimerCount() ).toBe( 0 );
		expect( window.location.href ).not.toBe( '/wp-admin/plugins.php' );
		expect( error ).toHaveBeenCalled();
	} );

	it( 'reloads for a same-page destination instead of a no-op assignment', async () => {
		const result = await wpAdminNavigateCallback( { path: '/wp-admin/index.php#section' } );
		jest.advanceTimersByTime( 1000 );

		expect( result.result.success ).toBe( true );
		expect( window.location.reload ).toHaveBeenCalled();
		expect( window.location.href ).toBe( 'https://example.wordpress.com/wp-admin/index.php' );
	} );

	it( 're-dispatches the pending event at redirect time, before the URL changes', async () => {
		// The re-dispatch re-arms the hook's `beforeunload` probe on the
		// pre-redirect page, ahead of the unsaved-changes dialog.
		const hrefsAtDispatch: string[] = [];
		const onPending = () => hrefsAtDispatch.push( window.location.href );
		window.addEventListener( NAVIGATION_PENDING_EVENT, onPending );

		await wpAdminNavigateCallback( { path: '/wp-admin/plugins.php' } );
		jest.advanceTimersByTime( 1000 );
		window.removeEventListener( NAVIGATION_PENDING_EVENT, onPending );

		expect( hrefsAtDispatch ).toEqual( [
			'https://example.wordpress.com/wp-admin/index.php',
			'https://example.wordpress.com/wp-admin/index.php',
		] );
		expect( window.location.href ).toBe( '/wp-admin/plugins.php' );
	} );

	it.each( [
		[ 'answered', () => markContinuationSent( storedState() ) ],
		[ 'cleared', () => completePendingNavigation( storedState() ) ],
	] )( 'skips the redirect when the call was %s during the delay', async ( _case, arrange ) => {
		await wpAdminNavigateCallback( { path: '/wp-admin/plugins.php' } );
		arrange();
		jest.advanceTimersByTime( 1000 );

		expect( window.location.href ).toBe( 'https://example.wordpress.com/wp-admin/index.php' );
		expect( window.location.reload ).not.toHaveBeenCalled();
	} );
} );
