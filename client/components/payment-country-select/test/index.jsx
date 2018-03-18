/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { mount, shallow } from 'enzyme';
import emitter from 'lib/mixins/emitter';

/**
 * Internal dependencies
 */
import CountrySelect from 'my-sites/domains/components/form/country-select';
import { PaymentCountrySelect } from '../';

describe( 'PaymentCountrySelect', () => {
	let props;

	beforeEach( () => {
		props = {
			name: 'test-country-select',
			label: 'Test country select',
			countriesList: {
				get: function() {
					return [
						{
							code: 'US',
							name: 'United States',
						},
						{
							code: 'AR',
							name: 'Argentina',
						},
					];
				},
			},
			countryCode: 'US',
		};
		emitter( props.countriesList );
	} );

	test( 'should display a country selection component with the expected properties', () => {
		const wrapper = shallow( <PaymentCountrySelect { ...props } /> );
		expect( wrapper.is( CountrySelect ) );
		expect( wrapper.prop( 'name' ) ).toEqual( props.name );
		expect( wrapper.prop( 'countriesList' ) ).toEqual( props.countriesList );
		expect( wrapper.prop( 'value' ) ).toEqual( props.countryCode );
	} );

	test( 'should correctly communicate the country which is initially selected', () => {
		// Test one of the allowed values in the country list.
		props.countryCode = 'US';
		props.onCountrySelected = jest.fn();
		shallow( <PaymentCountrySelect { ...props } /> );
		expect( props.onCountrySelected ).toHaveBeenLastCalledWith( props.name, 'US' );

		// Test another allowed value in the country list.
		props.countryCode = 'AR';
		shallow( <PaymentCountrySelect { ...props } /> );
		expect( props.onCountrySelected ).toHaveBeenLastCalledWith( props.name, 'AR' );

		// Test a country code which doesn't match one of the allowed values in
		// the country list. When passed to the callback function, this should
		// be treated as if no country was selected.
		props.countryCode = 'invalid';
		shallow( <PaymentCountrySelect { ...props } /> );
		expect( props.onCountrySelected ).toHaveBeenLastCalledWith( props.name, '' );
	} );

	test( 'should correctly communicate changes to the selected country', () => {
		// Simulate changing the country from "US" to "AR" and check that each
		// callback was called the expected number of times with the expected
		// input.
		props.countryCode = 'US';
		props.onCountrySelected = jest.fn();
		props.onChange = jest.fn();
		props.updateGlobalCountryCode = jest.fn();
		const wrapper = mount( <PaymentCountrySelect { ...props } /> );
		expect( props.onCountrySelected ).toHaveBeenLastCalledWith( props.name, 'US' );
		const simulatedChangeEvent = {
			target: {
				name: props.name,
				value: 'AR',
			},
		};
		wrapper.find( 'select[name="' + props.name + '"]' ).simulate( 'change', simulatedChangeEvent );
		expect( props.onCountrySelected ).toHaveBeenLastCalledWith( props.name, 'AR' );
		expect( props.onCountrySelected ).toHaveBeenCalledTimes( 2 );
		expect( props.onChange.mock.calls[ 0 ][ 0 ] ).toMatchObject( simulatedChangeEvent );
		expect( props.onChange ).toHaveBeenCalledTimes( 1 );
		expect( props.updateGlobalCountryCode ).toHaveBeenCalledWith( 'AR' );
		expect( props.updateGlobalCountryCode ).toHaveBeenCalledTimes( 1 );
	} );
} );
