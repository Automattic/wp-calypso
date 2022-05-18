/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import AutoDirection from '..';

describe( 'AutoDirection', () => {
	describe( 'component rendering', () => {
		test( 'adds a direction to RTL text', () => {
			render(
				<AutoDirection>
					<div data-testid="direction-test">השנה היא 2017.</div>
				</AutoDirection>
			);

			expect( screen.getByTestId( 'direction-test' ).getAttribute( 'direction' ) ).toEqual( 'rtl' );
		} );

		test( "doesn't add a direction to LTR text", () => {
			render(
				<AutoDirection>
					<div data-testid="direction-test">The year is 2017.</div>
				</AutoDirection>
			);

			expect( screen.getByTestId( 'direction-test' ).getAttribute( 'direction' ) ).toBeNull();
		} );
	} );
} );
