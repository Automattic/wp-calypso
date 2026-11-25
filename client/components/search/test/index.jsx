/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Search from '../';

vi.mock( 'calypso/lib/analytics/ga', () => ( {} ) );

describe( 'Search', () => {
	describe( 'initialValue', () => {
		test( 'should seed the input with the initialValue after mount', () => {
			render( <Search initialValue="hello" onSearch={ vi.fn() } /> );

			expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'hello' );
		} );

		test( 'should start with an empty input without an initialValue', () => {
			render( <Search onSearch={ vi.fn() } /> );

			expect( screen.getByRole( 'searchbox' ) ).toHaveValue( '' );
		} );
	} );
} );
