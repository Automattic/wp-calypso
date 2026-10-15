/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ChartBoundary from '../chart-boundary';

const Boom = () => {
	throw new Error( 'Loading chunk 9542 failed' );
};

describe( 'ChartBoundary', () => {
	beforeEach( () => {
		// React prints the caught error, and the boundary logs it itself.
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		// eslint-disable-next-line no-console
		console.error.mockRestore();
	} );

	it( 'swaps in the fallback when the chart throws, leaving the page it sits in', () => {
		render(
			<div>
				<p>Views</p>
				<ChartBoundary fallback={ <p>Fallback</p> }>
					<Boom />
				</ChartBoundary>
			</div>
		);

		expect( screen.getByText( 'Views' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Fallback' ) ).toBeInTheDocument();
	} );

	it( 'reports the failure, so a broken chunk is not silent', () => {
		render(
			<ChartBoundary fallback={ null }>
				<Boom />
			</ChartBoundary>
		);

		// eslint-disable-next-line no-console
		expect( console.error ).toHaveBeenCalledWith(
			'Stats widget: the chart failed to render.',
			expect.objectContaining( { message: 'Loading chunk 9542 failed' } ),
			expect.anything()
		);
	} );
} );
