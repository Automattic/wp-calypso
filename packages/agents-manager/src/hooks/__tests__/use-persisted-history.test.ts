/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { usePersistedHistory } from '../use-persisted-history';
import type { Location } from 'history';

const STORAGE_KEY = 'agents-manager-router-history';

function entry( pathname: string ) {
	return { pathname, search: '', hash: '', key: pathname, state: null };
}

function storeHistory( siteKey: string, entries: ReturnType< typeof entry >[], index: number ) {
	sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { [ siteKey ]: { entries, index } } ) );
}

describe( 'usePersistedHistory', () => {
	afterEach( () => {
		sessionStorage.clear();
	} );

	it( 'restores the persisted history for the site', () => {
		storeHistory( 'site-1', [ entry( '/' ), entry( '/chat' ) ], 1 );

		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		expect( result.current.history.length ).toBe( 2 );
		expect( result.current.history.location.pathname ).toBe( '/chat' );
	} );

	it( 'falls back to the default root entry when there is no persisted history', () => {
		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		expect( result.current.history.length ).toBe( 1 );
		expect( result.current.history.location.pathname ).toBe( '/' );
	} );

	it( 'keeps histories separate per site', () => {
		storeHistory( 'site-1', [ entry( '/' ), entry( '/chat' ) ], 1 );

		const { result } = renderHook( () => usePersistedHistory( 'site-2' ) );

		expect( result.current.history.length ).toBe( 1 );
		expect( result.current.history.location.pathname ).toBe( '/' );
	} );

	it( 'persists navigations, including route state', () => {
		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		act( () => {
			result.current.history.push( entry( '/zendesk' ) as Location, {
				conversationId: 'conversation-abc',
			} );
		} );

		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '{}' );
		expect( stored[ 'site-1' ].index ).toBe( 1 );
		expect( stored[ 'site-1' ].entries[ 1 ].pathname ).toBe( '/zendesk' );
		expect( stored[ 'site-1' ].entries[ 1 ].state ).toEqual( {
			conversationId: 'conversation-abc',
		} );
	} );

	it( 'navigates back and forward through the tab history', () => {
		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		act( () => {
			result.current.history.push( entry( '/chat' ) as Location );
		} );
		act( () => {
			result.current.history.back();
		} );

		expect( result.current.history.location.pathname ).toBe( '/' );

		act( () => {
			result.current.history.forward();
		} );

		expect( result.current.history.location.pathname ).toBe( '/chat' );
	} );

	it( 'merges with other sites when persisting', () => {
		storeHistory( 'site-1', [ entry( '/' ), entry( '/chat' ) ], 1 );

		const { result } = renderHook( () => usePersistedHistory( 'site-2' ) );
		act( () => {
			result.current.history.push( entry( '/history' ) as Location );
		} );

		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '{}' );
		expect( stored[ 'site-1' ].entries ).toHaveLength( 2 );
		expect( stored[ 'site-2' ].entries[ 1 ].pathname ).toBe( '/history' );
	} );

	it.each( [
		[ 'unparseable JSON', 'not-valid-json' ],
		[ 'entries is not an array', JSON.stringify( { 'site-1': { entries: 'nope', index: 0 } } ) ],
		[
			'index is out of range',
			JSON.stringify( { 'site-1': { entries: [ entry( '/chat' ) ], index: 5 } } ),
		],
		[
			'an entry has no pathname',
			JSON.stringify( { 'site-1': { entries: [ { search: '' } ], index: 0 } } ),
		],
	] )( 'falls back to the default root entry when the stored data is %s', ( _label, stored ) => {
		sessionStorage.setItem( STORAGE_KEY, stored );

		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		expect( result.current.history.length ).toBe( 1 );
		expect( result.current.history.location.pathname ).toBe( '/' );
	} );
} );
