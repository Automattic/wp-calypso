/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import PlansSkipButton from '../';

describe( 'PlansSkipButton', () => {
	test( 'should render', () => {
		const component = renderer.create( <PlansSkipButton /> );
		const tree = component.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'should render arrow-left in rtl mode', () => {
		const component = renderer.create( <PlansSkipButton isRtl /> );
		const tree = component.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
