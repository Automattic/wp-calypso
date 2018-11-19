/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { AbandonPaymentButton } from '../abandon-payment-button';

describe( 'AbandonPaymentButton', () => {
	const defaultProps = {
		translate: x => x,
		orderId: 123,
	};

	const wrapper = shallow( <AbandonPaymentButton { ...defaultProps } /> );

	const rules = [ 'Button[primary=false]', 'Gridicon[icon=trash]' ];

	rules.forEach( rule => {
		test( rule, () => {
			expect( wrapper.find( rule ) ).toHaveLength( 1 );
		} );
	} );
} );
