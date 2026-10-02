/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import useCountUp from '../use-count-up';

describe( 'useCountUp', () => {
	let now;
	let callbacks;

	beforeEach( () => {
		now = 0;
		callbacks = [];
		jest.spyOn( performance, 'now' ).mockImplementation( () => now );
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( callback ) => {
			callbacks.push( callback );
			return callbacks.length;
		} );
		jest.spyOn( window, 'cancelAnimationFrame' ).mockImplementation( () => {} );
		window.matchMedia = jest.fn().mockReturnValue( { matches: false } );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	const advanceTo = ( time ) => {
		now = time;
		const pending = callbacks;
		callbacks = [];
		act( () => pending.forEach( ( callback ) => callback( time ) ) );
	};

	it( 'counts up from zero and settles on the target', () => {
		const { result } = renderHook( () => useCountUp( 1000, 800 ) );
		expect( result.current ).toBe( 0 );

		advanceTo( 400 );
		expect( result.current ).toBeGreaterThan( 0 );
		expect( result.current ).toBeLessThan( 1000 );

		advanceTo( 800 );
		expect( result.current ).toBe( 1000 );
	} );

	it( 'drops to zero instantly and counts up again from there', () => {
		const { result, rerender } = renderHook( ( { target } ) => useCountUp( target, 800 ), {
			initialProps: { target: 1000 },
		} );
		advanceTo( 800 );

		rerender( { target: 0 } );
		expect( result.current ).toBe( 0 );
		expect( callbacks ).toHaveLength( 0 );

		rerender( { target: 500 } );
		advanceTo( 1200 );
		expect( result.current ).toBeGreaterThan( 0 );
		expect( result.current ).toBeLessThan( 500 );

		advanceTo( 1600 );
		expect( result.current ).toBe( 500 );
	} );

	it( 'jumps between two non-zero values', () => {
		const { result, rerender } = renderHook( ( { target } ) => useCountUp( target, 800 ), {
			initialProps: { target: 1000 },
		} );
		advanceTo( 800 );

		rerender( { target: 500 } );
		expect( result.current ).toBe( 500 );
		expect( callbacks ).toHaveLength( 0 );
	} );

	it( 'waits for a non-zero value before counting', () => {
		const { result, rerender } = renderHook( ( { target } ) => useCountUp( target, 800 ), {
			initialProps: { target: 0 },
		} );
		expect( callbacks ).toHaveLength( 0 );

		rerender( { target: 1000 } );
		advanceTo( 400 );
		expect( result.current ).toBeGreaterThan( 0 );
		expect( result.current ).toBeLessThan( 1000 );
	} );

	it( 'jumps straight to the target when reduced motion is preferred', () => {
		window.matchMedia = jest.fn().mockReturnValue( { matches: true } );
		const { result } = renderHook( () => useCountUp( 1000 ) );
		expect( result.current ).toBe( 1000 );
	} );
} );
