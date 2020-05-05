/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { assert } from 'chai';
import { noop } from 'lodash';
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import D3Base from '..';

describe( 'D3base', () => {
	const shallowWithoutLifecycle = ( arg ) => shallow( arg, { disableLifecycleMethods: true } );

	test( 'should have d3-base CSS class', () => {
		const base = shallowWithoutLifecycle( <D3Base drawChart={ noop } getParams={ noop } /> );

		assert.lengthOf( base.find( '.d3-base' ), 1 );
	} );

	test( 'should render an svg', () => {
		const getParams = () => ( { width: 100, height: 100 } );

		const base = mount( <D3Base drawChart={ noop } getParams={ getParams } /> );

		assert.lengthOf( base.render().find( 'svg' ), 1 );
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

		assert.lengthOf( base.render().find( 'circle' ), 1 );
	} );

	test( 'should pass a property of getParams output to drawChart function', () => {
		const drawChart = ( svg, params ) => {
			return svg.append( params.tagName );
		};

		const getParams = () => ( {
			tagName: 'circle',
		} );

		const base = mount( <D3Base drawChart={ drawChart } getParams={ getParams } /> );

		assert.lengthOf( base.render().find( 'circle' ), 1 );
	} );
} );
