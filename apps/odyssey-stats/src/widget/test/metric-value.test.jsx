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

	it( 'shows the compact figure', () => {
		render( <MetricValue value={ 118492 } describe={ describe_ } /> );
		expect( screen.getByText( '118.5K' ) ).toBeInTheDocument();
	} );

	it( 'adds a tooltip with the full amount when the compact form hides digits', () => {
		render( <MetricValue value={ 118492 } describe={ describe_ } /> );
		expect( screen.getByTestId( 'tooltip' ) ).toHaveAttribute( 'data-text', '118,492 views' );
	} );

	it( 'gives screen readers the full amount, and hides the compact one from them', () => {
		const { container } = render( <MetricValue value={ 118492 } describe={ describe_ } /> );

		expect( container.querySelector( '.screen-reader-text' ) ).toHaveTextContent( '118,492 views' );
		expect( screen.getByText( '118.5K' ) ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'skips the tooltip when the figure is already exact', () => {
		render( <MetricValue value={ 617 } describe={ describe_ } /> );
		expect( screen.getByText( '617' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'tooltip' ) ).not.toBeInTheDocument();
	} );
} );
