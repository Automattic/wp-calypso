/**
 * @jest-environment jsdom
 */

import { shallow, mount } from 'enzyme';
import D3Base from '..';

const noop = () => {};

describe( 'D3base', () => {
	const shallowWithoutLifecycle = ( arg ) => shallow( arg, { disableLifecycleMethods: true } );

	test( 'should have d3-base CSS class', () => {
		const base = shallowWithoutLifecycle( <D3Base drawChart={ noop } getParams={ noop } /> );

		expect( base.find( '.d3-base' ).length ).toBe( 1 );
	} );

	test( 'should render an svg', () => {
		const getParams = () => ( { width: 100, height: 100 } );

		const base = mount( <D3Base drawChart={ noop } getParams={ getParams } /> );

		expect( base.render().find( 'svg' ).length ).toBe( 1 );
	} );

	test( 'should render a result of the drawChart prop', () => {
		const drawChart = ( svg ) => {
			return svg.append( 'circle' );
		};

		const getParams = () => ( {
			width: 100,
			height: 100,
		} );

		const base = mount( <D3Base drawChart={ drawChart } getParams={ getParams } /> );

		expect( base.render().find( 'circle' ).length ).toBe( 1 );
	} );

	test( 'should pass a property of getParams output to drawChart function', () => {
		const drawChart = ( svg, params ) => {
			return svg.append( params.tagName );
		};

		const getParams = () => ( {
			tagName: 'circle',
		} );

		const base = mount( <D3Base drawChart={ drawChart } getParams={ getParams } /> );

		expect( base.render().find( 'circle' ).length ).toBe( 1 );
	} );
} );
