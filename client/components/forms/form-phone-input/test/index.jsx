/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { FormPhoneInput } from '../';
import mockCountriesList from './mocks/mock-countries-list';
import mockCountriesListEmpty from './mocks/mock-countries-list-empty';

const countries = mockCountriesList.get();

describe( 'FormPhoneInput', () => {
	describe( 'getValue()', () => {
		test( 'should set country from props', () => {
			const phoneComponent = shallow(
				<FormPhoneInput
					countriesList={ mockCountriesList }
					initialCountryCode={ countries[ 1 ].code }
				/>
			);
			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		test( 'should set country to first element when not specified', () => {
			const phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesList } /> );
			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );

		test( 'should update country on change', () => {
			const phoneComponent = mount( <FormPhoneInput countriesList={ mockCountriesList } /> );
			phoneComponent.find( 'select' ).simulate( 'change', {
				target: {
					value: countries[ 1 ].code,
				},
			} );

			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		test( 'should have no country with empty countryList', () => {
			const phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesListEmpty } /> );
			expect( phoneComponent.instance().getValue().countryData ).to.equal( undefined );
		} );

		test( 'should update country on countryList change', () => {
			let phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesListEmpty } /> );

			// Render again with filled country list
			phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesList } /> );

			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );
	} );
} );
