/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import D3Base from '../index';

const noop = () => {};
const drawChart = ( svg ) => {
	const circle = document.createElement( 'circle' );
	circle.setAttribute( 'data-testid', 'test-circle' );
	return svg.append( circle );
};

describe( 'D3base', () => {
	test( 'should have d3Base class', () => {
		const { container } = render( <D3Base drawChart={ noop } getParams={ noop } /> );
		expect( container.firstChild ).toHaveClass( 'd3-base' );
	} );

	test( 'should render an svg', () => {
		const { container } = render( <D3Base drawChart={ noop } getParams={ noop } /> );
		waitFor( async () => {
			await expect( container.getElementsByTagName( 'svg' ) ).toHaveLength( 1 );
		} );
	} );

	test( 'should render a result of the drawChart prop', () => {
		render( <D3Base drawChart={ drawChart } getParams={ noop } /> );
		waitFor( async () => {
			expect( screen.getByTestId( 'test-circle' ) ).toBeInTheDocument();
		} );
	} );

	test( 'should pass a property of getParams output to drawChart function', () => {
		const getParams = () => ( {
			tagName: 'circle',
		} );
		render( <D3Base drawChart={ drawChart } getParams={ getParams } /> );
		waitFor( async () => {
			expect( screen.getByTestId( 'test-circle' ) ).toBeInTheDocument();
		} );
	} );
} );
