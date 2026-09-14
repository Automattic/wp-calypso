/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Search from '../';

jest.mock( 'calypso/lib/analytics/ga', () => ( {} ) );

describe( 'Search', () => {
	describe( 'initialValue', () => {
		test( 'should seed the input with the initialValue after mount', () => {
			render( <Search initialValue="hello" onSearch={ jest.fn() } /> );

			expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'hello' );
		} );

		test( 'should start with an empty input without an initialValue', () => {
			render( <Search onSearch={ jest.fn() } /> );

			expect( screen.getByRole( 'searchbox' ) ).toHaveValue( '' );
		} );
	} );
} );
