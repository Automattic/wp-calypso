/**
 * @format
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
import { shouldRenderAdditionalEbanxFields } from 'lib/checkout/ebanx';

import mockCountriesList from './mocks/mock-countries-list';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

jest.mock( 'lib/checkout/ebanx', () => {
	return {
		shouldRenderAdditionalEbanxFields: jest.fn( false ),
	};
} );

const defaultProps = {
	card: {},
	countriesList: mockCountriesList,
	eventFormName: 'A fine form',
	translate: identity,
	isFieldInvalid: identity,
	onFieldChange: noop,
};

describe( 'CreditCardFormFields', () => {
	test( 'should have `CreditCardFormFields` class', () => {
		const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
		expect( wrapper.find( '.credit-card-form-fields' ) ).toHaveLength( 1 );
	} );

	describe( 'with ebanx activated', () => {
		beforeAll( () => {
			shouldRenderAdditionalEbanxFields.mockReturnValue( true );
		} );
		afterAll( () => {
			shouldRenderAdditionalEbanxFields.mockReturnValue( false );
		} );

		test( 'should display Ebanx fields when an Ebanx payment country is selected', () => {
			const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
			wrapper.setProps( { card: { country: 'BR' } } );
			expect( wrapper.find( 'EbanxBrazilPaymentFields' ) ).toHaveLength( 1 );
		} );
	} );
} );
