/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

import { WebPaymentBox } from '../web-payment-box';

const defaultCart = {
	currency: 'USD',
	total_cost: 12.34,
	products: [],
};

const defaultProps = {
	cart: defaultCart,
	translate: identity,
	countriesList: [],
	onSubmit: jest.fn(),
	transactionStep: { name: 'test' },
	transaction: {},
};

describe( 'WebPaymentBox', () => {
	test( 'should render', () => {
		shallow( <WebPaymentBox { ...defaultProps } /> );
	} );
} );
