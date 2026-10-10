/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MetricValue from '../metric-value';

jest.mock( '@wordpress/components', () => ( {
	Tooltip: ( { text, children } ) => (
		<div data-testid="tooltip" data-text={ text }>
			{ children }
		</div>
	),
} ) );

const describe_ = ( count ) => `${ count } views`;

describe( 'MetricValue', () => {
	beforeEach( () => {
		// Reduced motion makes the count-up land on the value straight away.
		window.matchMedia = jest.fn().mockReturnValue( { matches: true } );
	} );

	it( 'shows the compact figure, with the full amount in a tooltip and for screen readers', () => {
		const { container } = render( <MetricValue value={ 118492 } describe={ describe_ } /> );

		expect( screen.getByText( '118.5K' ) ).toHaveAttribute( 'aria-hidden', 'true' );
		expect( screen.getByTestId( 'tooltip' ) ).toHaveAttribute( 'data-text', '118,492 views' );
		expect( container.querySelector( '.screen-reader-text' ) ).toHaveTextContent( '118,492 views' );
	} );

	it( 'skips the tooltip when the figure is already exact', () => {
		render( <MetricValue value={ 617 } describe={ describe_ } /> );
		expect( screen.getByText( '617' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'tooltip' ) ).not.toBeInTheDocument();
	} );
} );
