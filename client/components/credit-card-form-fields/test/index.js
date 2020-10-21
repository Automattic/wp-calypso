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
import { shouldRenderAdditionalCountryFields } from 'calypso/lib/checkout/processor-specific';
import CountrySpecificPaymentFields from 'calypso/my-sites/checkout/checkout/country-specific-payment-fields';

jest.mock( 'lib/checkout/processor-specific', () => ( {
	shouldRenderAdditionalCountryFields: jest.fn( false ),
} ) );

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

	describe( 'with ebanx activated', () => {
		beforeAll( () => {
			shouldRenderAdditionalCountryFields.mockReturnValue( true );
		} );
		afterAll( () => {
			shouldRenderAdditionalCountryFields.mockReturnValue( false );
		} );

		test( 'should display Ebanx fields when an Ebanx payment country is selected and there is a transaction in process', () => {
			const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
			wrapper.setProps( { card: { country: 'BR' } } );
			expect( wrapper.find( CountrySpecificPaymentFields ) ).toHaveLength( 1 );
		} );

		test( 'should not display Ebanx fields when there is a transaction in process', () => {
			const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
			wrapper.setProps( { card: { country: 'BR' }, isNewTransaction: false } );
			expect( wrapper.find( CountrySpecificPaymentFields ) ).toHaveLength( 0 );
		} );
	} );
} );
