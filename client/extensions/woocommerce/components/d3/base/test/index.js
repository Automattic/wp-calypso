/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import D3Base from '../index';

describe( 'D3base', () => {
	const shallowWithoutLifecycle = ( arg ) => shallow( arg, { disableLifecycleMethods: true } );

	test( 'should have d3Base class', () => {
		const base = shallowWithoutLifecycle( <D3Base drawChart={ noop } getParams={ noop } /> );
		assert.lengthOf( base.find( '.d3-base' ), 1 );
	} );

	test( 'should render an svg', () => {
		const base = mount( <D3Base drawChart={ noop } getParams={ noop } /> );
		assert.lengthOf( base.render().find( 'svg' ), 1 );
	} );

	test( 'should render a result of the drawChart prop', () => {
		const drawChart = ( svg ) => {
			return svg.append( 'circle' );
		};
		const base = mount( <D3Base drawChart={ drawChart } getParams={ noop } /> );
		assert.lengthOf( base.render().find( 'circle' ), 1 );
	} );

	test( 'should pass a property of getParams output to drawChart function', () => {
		const getParams = () => ( {
			tagName: 'circle',
		} );
		const drawChart = ( svg, params ) => {
			return svg.append( params.tagName );
		};
		const base = mount( <D3Base drawChart={ drawChart } getParams={ getParams } /> );
		assert.lengthOf( base.render().find( 'circle' ), 1 );
	} );
} );
