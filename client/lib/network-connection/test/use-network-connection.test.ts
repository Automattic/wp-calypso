/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import useNetworkConnection from '../use-network-connection';

describe( 'useNetworkConnection', () => {
	let originalOnlineDescriptor: PropertyDescriptor | undefined;

	beforeAll( () => {
		originalOnlineDescriptor = Object.getOwnPropertyDescriptor( navigator, 'onLine' );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	afterAll( () => {
		if ( originalOnlineDescriptor ) {
			Object.defineProperty( navigator, 'onLine', originalOnlineDescriptor );
		}
	} );

	test( 'should return the initial online status from navigator.onLine', () => {
		Object.defineProperty( navigator, 'onLine', {
			configurable: true,
			value: true,
		} );
		const { result } = renderHook( () => useNetworkConnection() );
		expect( result.current ).toEqual( { isOnline: true } );

		Object.defineProperty( navigator, 'onLine', {
			configurable: true,
			value: false,
		} );
		const { result: result2 } = renderHook( () => useNetworkConnection() );
		expect( result2.current ).toEqual( { isOnline: false } );
	} );

	test( 'should update status to true when online event is fired', () => {
		Object.defineProperty( navigator, 'onLine', {
			configurable: true,
			value: false,
		} );
		const { result } = renderHook( () => useNetworkConnection() );
		expect( result.current ).toEqual( { isOnline: false } );

		act( () => {
			window.dispatchEvent( new Event( 'online' ) );
		} );

		expect( result.current ).toEqual( { isOnline: true } );
	} );

	test( 'should update status to false when offline event is fired', () => {
		Object.defineProperty( navigator, 'onLine', {
			configurable: true,
			value: true,
		} );
		const { result } = renderHook( () => useNetworkConnection() );
		expect( result.current ).toEqual( { isOnline: true } );

		act( () => {
			window.dispatchEvent( new Event( 'offline' ) );
		} );

		expect( result.current ).toEqual( { isOnline: false } );
	} );

	test( 'should remove event listeners on unmount', () => {
		const addEventListenerSpy = jest.spyOn( window, 'addEventListener' );
		const removeEventListenerSpy = jest.spyOn( window, 'removeEventListener' );

		const { unmount } = renderHook( () => useNetworkConnection() );

		expect( addEventListenerSpy ).toHaveBeenCalledWith( 'online', expect.any( Function ) );
		expect( addEventListenerSpy ).toHaveBeenCalledWith( 'offline', expect.any( Function ) );

		unmount();

		expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'online', expect.any( Function ) );
		expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'offline', expect.any( Function ) );
	} );
} );
