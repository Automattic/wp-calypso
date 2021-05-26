/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */

import { CountrySpecificPaymentFields } from '../country-specific-payment-fields';

const defaultProps = {
	countryCode: 'BR',
	countriesList: [
		{
			code: 'BR',
			name: 'Brazil',
		},
	],
	getErrorMessage: jest.fn(),
	getFieldValue: jest.fn(),
	handleFieldChange: jest.fn(),
	fieldClassName: 'country-brazil',
	translate: ( string ) => string,
};

describe( '<CountrySpecificPaymentFields />', () => {
	test( 'should render', () => {
		const wrapper = shallow( <CountrySpecificPaymentFields { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should call this.props.handleFieldChange when updating field', () => {
		const wrapper = shallow( <CountrySpecificPaymentFields { ...defaultProps } /> );
		const documentInput = wrapper.find( '[name="document"]' );
		const event = { target: { name: 'document', value: 'spam' } };
		documentInput.simulate( 'change', event );
		expect( defaultProps.handleFieldChange ).toBeCalledWith( 'document', 'spam' );
	} );

	test( 'should disable fields', () => {
		const wrapper = shallow( <CountrySpecificPaymentFields { ...defaultProps } /> );
		expect( wrapper.find( 'Input' ).first().props().disabled ).toEqual( false );
		wrapper.setProps( { disableFields: true } );
		expect( wrapper.find( 'Input' ).first().props().disabled ).toEqual( true );
	} );
} );
