/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import useResourceReadState from '../use-resource-read-state';

beforeEach( () => localStorage.clear() );

test( 'persists explicit read changes, supports undo, and isolates accounts', () => {
	const { result, rerender, unmount } = renderHook( ( id ) => useResourceReadState( id ), {
		initialProps: 1,
	} );
	act( () => {
		result.current.setRead( 'hub-1', true );
	} );
	expect( result.current.readIds ).toEqual( [ 'hub-1' ] );
	rerender( 2 );
	expect( result.current.readIds ).toEqual( [] );
	rerender( 1 );
	expect( result.current.readIds ).toEqual( [ 'hub-1' ] );
	unmount();
	const nextVisit = renderHook( () => useResourceReadState( 1 ) );
	expect( nextVisit.result.current.readIds ).toEqual( [ 'hub-1' ] );
	act( () => {
		nextVisit.result.current.setRead( 'hub-1', false );
	} );
	expect( nextVisit.result.current.readIds ).toEqual( [] );
} );

test( 'recovers from malformed saved data and syncs changes from another tab', () => {
	localStorage.setItem( 'a4a-library-read-v1:1', '{broken' );
	const { result } = renderHook( () => useResourceReadState( 1 ) );
	expect( result.current.readIds ).toEqual( [] );
	act( () => {
		localStorage.setItem( 'a4a-library-read-v1:1', '["hub-2",42]' );
		window.dispatchEvent( new StorageEvent( 'storage', { key: 'a4a-library-read-v1:1' } ) );
	} );
	expect( result.current.readIds ).toEqual( [ 'hub-2' ] );
} );

test( 'reports a failed save without falsely marking the resource read', () => {
	const { result } = renderHook( () => useResourceReadState( 1 ) );
	const write = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
		throw new Error( 'Storage blocked' );
	} );
	act( () => {
		result.current.setRead( 'hub-1', true );
	} );
	expect( result.current.error ).toBe( true );
	expect( result.current.readIds ).toEqual( [] );
	write.mockRestore();
} );
