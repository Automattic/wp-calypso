/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import D3Base from '../index';

const noop = () => {};

describe( 'D3base', () => {
	test( 'should have d3Base class', () => {
		const { container } = render( <D3Base drawChart={ noop } getParams={ noop } /> );
		expect( container.firstChild ).toHaveClass( 'd3-base' );
	} );
} );
