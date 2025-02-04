/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useSnakeCasedKeys from '../use-snake-cased-keys';

describe( 'useSnakeCasedKeys', () => {
	test( 'ensures reference equality given same input', () => {
		const input = { fooBar: 'fooBar' };
		const { result, rerender } = renderHook( ( params ) => useSnakeCasedKeys( params ), {
			initialProps: { input },
		} );
		const previous = result.current;

		rerender( { input } );
		expect( result.current ).toBe( previous );
	} );

	test( 'given fooBar it will convert correctly', () => {
		const input = { fooBar: 'fooBar' };
		const expectedOutput = { foo_bar: 'fooBar' };

		const { result } = renderHook( ( params ) => useSnakeCasedKeys( params ), {
			initialProps: { input },
		} );

		expect( result.current ).toEqual( expectedOutput );
	} );

	test( 'given foo_bar it will convert correctly', () => {
		const input = { foo_bar: 'fooBar' };
		const expectedOutput = { foo_bar: 'fooBar' };

		const { result } = renderHook( ( params ) => useSnakeCasedKeys( params ), {
			initialProps: { input },
		} );

		expect( result.current ).toEqual( expectedOutput );
	} );

	test( 'given foo123 it will convert correctly', () => {
		const input = { foo123bar: 'fooBar' };
		const expectedOutput = { foo_123_bar: 'fooBar' };

		const { result } = renderHook( ( params ) => useSnakeCasedKeys( params ), {
			initialProps: { input },
		} );

		expect( result.current ).toEqual( expectedOutput );
	} );
} );
