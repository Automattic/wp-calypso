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

/**
 * Internal dependencies
 */

import { EbanxBrazilPaymentFields } from '../ebanx-brazil-payment-fields';

const defaultProps = {
	countryCode: 'BR',
	countriesList: {
		get: () => [ { code: 'BR', name: 'Brazil' } ],
	},
	getErrorMessage: jest.fn(),
	getFieldValue: jest.fn(),
	handleFieldChange: jest.fn(),
	fieldClassName: 'ebanx-brazil',
	translate: identity,
};

describe( '<EbanxBrazilPaymentFields />', () => {
	test( 'should render', () => {
		const wrapper = shallow( <EbanxBrazilPaymentFields { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should call this.props.handleFieldChange when updating field', () => {
		const wrapper = shallow( <EbanxBrazilPaymentFields { ...defaultProps } /> );
		const documentInput = wrapper.find( '[name="document"]' );
		const event = { target: { name: 'document', value: 'spam' } };
		documentInput.simulate( 'change', event );
		expect( defaultProps.handleFieldChange ).toBeCalledWith( 'document', 'spam' );
	} );
} );
