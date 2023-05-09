/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import D3Base from '..';

const noop = () => {};

describe( 'D3base', () => {
	test( 'should have d3-base CSS class', () => {
		const { container } = render( <D3Base drawChart={ noop } getParams={ noop } /> );
		expect( container.firstChild ).toHaveClass( 'd3-base' );
	} );

	test( 'should render an svg', () => {
		const getParams = () => ( { width: 100, height: 100 } );
		const { container } = render( <D3Base drawChart={ noop } getParams={ getParams } /> );
		expect( container.getElementsByTagName( 'svg' ) ).toHaveLength( 1 );
	} );

	test( 'should render a result of the drawChart prop', () => {
		const drawChart = ( svg ) => {
			return svg.append( 'circle' );
		};

		const getParams = () => ( {
			width: 100,
			height: 100,
		} );

		const { container } = render( <D3Base drawChart={ drawChart } getParams={ getParams } /> );
		expect( container.getElementsByTagName( 'circle' ) ).toHaveLength( 1 );
	} );

	test( 'should pass a property of getParams output to drawChart function', () => {
		const drawChart = ( svg, params ) => {
			return svg.append( params.tagName );
		};

		const getParams = () => ( {
			tagName: 'circle',
		} );

		const { container } = render( <D3Base drawChart={ drawChart } getParams={ getParams } /> );
		expect( container.getElementsByTagName( 'circle' ) ).toHaveLength( 1 );
	} );
} );
