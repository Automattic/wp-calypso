/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { CreditCardFormFields } from '../';
import CountrySpecificPaymentFields from 'calypso/my-sites/checkout/checkout/country-specific-payment-fields';

const defaultProps = {
	card: {},
	countriesList: [],
	eventFormName: 'A fine form',
	translate: identity,
	isFieldInvalid: identity,
	onFieldChange: noop,
	isNewTransaction: true,
};

describe( 'CreditCardFormFields', () => {
	test( 'should have `CreditCardFormFields` class', () => {
		const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
		expect( wrapper.find( '.credit-card-form-fields' ) ).toHaveLength( 1 );
	} );

	test( 'should not render ebanx fields', () => {
		const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
		expect( wrapper.find( CountrySpecificPaymentFields ) ).toHaveLength( 0 );
	} );
} );
