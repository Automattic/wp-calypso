/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { PaymentBox } from '../payment-box';

jest.mock( 'lib/cart-values', () => ( {
	isPaymentMethodEnabled: jest.fn( false ),
	paymentMethodName: jest.fn( false ),
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'PaymentBox', () => {
	const defaultProps = {
		cart: {},
		title: 'Hoi!',
		currentPaymentMethod: 'credit-card',
		paymentMethods: [ 'paypal', 'credit-card' ],
		currentPage: 'mainForm',
		translate: identity,
	};

	test( 'should not render paymethods SectionNav when there are no payment methods', () => {
		const wrapper = shallow( <PaymentBox { ...defaultProps } /> );
		expect( wrapper.find( 'SectionNav' ) ).toHaveLength( 1 );
		wrapper.setProps( { paymentMethods: null } );
		expect( wrapper.find( 'SectionNav' ) ).toHaveLength( 0 );
	} );
} );
