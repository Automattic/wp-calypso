/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import PlansSkipButton from 'jetpack-connect/plans-skip-button';
import renderer from 'react-test-renderer';

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
