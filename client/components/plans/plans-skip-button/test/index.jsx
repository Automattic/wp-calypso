/**
 * @format
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PlansSkipButton } from '../';

describe( 'PlansSkipButton', () => {
	test( 'should render', () => {
		const component = shallow( <PlansSkipButton /> );
		expect( component ).toMatchSnapshot();
	} );

	test( 'should render arrow-left in rtl mode', () => {
		const component = shallow( <PlansSkipButton isRtl /> );
		expect( component ).toMatchSnapshot();
	} );
} );
