/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import noop from 'lodash/noop';
import identity from 'lodash/identity';
/**
 * Internal dependencies
 */
import { CreditCardFormFields } from '../';
import { isEbanx } from 'lib/credit-card-details/ebanx';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

jest.mock( 'lib/credit-card-details/ebanx', () => {
	return {
		isEbanx: jest.fn( false ),
	};
} );

const defaultProps = {
	card: {},
	countriesList: {},
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
			isEbanx.mockReturnValue( true );
		} );
		afterAll( () => {
			isEbanx.mockReturnValue( false );
		} );

		test( 'should display Ebanx fields when an Ebanx payment country is selected', () => {
			const wrapper = shallow( <CreditCardFormFields { ...defaultProps } /> );
			wrapper.setState( { countryCode: 'BR' } );
			// shouldComponentUpdate prevents setState from triggering a rerender in <CreditCardFormFields />
			wrapper.setProps( { card: { country: 'BR' } } );
			expect( wrapper.find( '.ebanx-details-required' ) ).toHaveLength( 1 );
			expect( wrapper.find( '.credit-card-form-fields__info-text' ) ).toHaveLength( 1 );
		} );
	} );
} );
