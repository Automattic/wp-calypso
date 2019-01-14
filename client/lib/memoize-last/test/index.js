/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import memoizeLast from '../';

describe( 'memoizeLast', () => {
	let mockFunction;
	let memoizedFunction;

	beforeEach( () => {
		mockFunction = jest.fn( ( a, b, c ) => ( {
			result: a + b + c,
		} ) );
		memoizedFunction = memoizeLast( mockFunction );
	} );

	test( 'it should call the function if it has not been called yet', () => {
		const result = memoizedFunction( 1, 2, 3 );
		expect( mockFunction ).toHaveBeenCalledTimes( 1 );
		expect( mockFunction ).toHaveBeenCalledWith( 1, 2, 3 );
		expect( result ).toEqual( { result: 6 } );
	} );

	test( 'it should not call the function if it was last called with the same args', () => {
		const result1 = memoizedFunction( 1, 2, 3 );
		const result2 = memoizedFunction( 1, 2, 3 );
		expect( mockFunction ).toHaveBeenCalledTimes( 1 );
		expect( mockFunction ).toHaveBeenCalledWith( 1, 2, 3 );
		expect( result2 ).toBe( result1 );
	} );

	test( 'it should call the function if it is called with different args', () => {
		const result1 = memoizedFunction( 1, 2, 3 );
		const result2 = memoizedFunction( 3, 2, 1 );
		expect( mockFunction ).toHaveBeenCalledTimes( 2 );
		expect( mockFunction ).toHaveBeenCalledWith( 1, 2, 3 );
		expect( mockFunction ).toHaveBeenCalledWith( 3, 2, 1 );
		expect( result1 ).toEqual( { result: 6 } );
		expect( result2 ).toEqual( { result: 6 } );
		expect( result2 ).not.toBe( result1 );
	} );
} );
