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

	test( 'given an object with mixture of snake_cased/camelCased keys it will convert correctly', () => {
		const input = { fooBar: 'fooBar', foo_not_bar: 'foo_not_bar', foo123: 'foo123' };
		const expectedOutput = { foo_bar: 'fooBar', foo_not_bar: 'foo_not_bar', foo123: 'foo123' };

		const { result } = renderHook( ( params ) => useSnakeCasedKeys( params ), {
			initialProps: { input },
		} );

		expect( result.current ).toEqual( expectedOutput );
	} );
} );
