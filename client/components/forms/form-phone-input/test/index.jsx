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
import { withContainer as useFakeDom } from 'test/helpers/use-fake-dom';

const countries = mockCountriesList.get();

describe( 'FormPhoneInput', function() {
	useFakeDom();

	describe( 'getValue()', function() {
		it( 'should set country from props', function() {
			const phoneComponent = shallow(
				<FormPhoneInput countriesList={ mockCountriesList }
					initialCountryCode={ countries[ 1 ].code } />
			);
			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		it( 'should set country to first element when not specified', function() {
			const phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesList } /> );
			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );

		it( 'should update country on change', function() {
			const phoneComponent = mount( <FormPhoneInput countriesList={ mockCountriesList } /> );
			phoneComponent.find( 'select' ).simulate( 'change', {
				target: {
					value: countries[ 1 ].code
				}
			} );

			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		it( 'should have no country with empty countryList', function() {
			const phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesListEmpty } /> );
			expect( phoneComponent.instance().getValue().countryData ).to.equal( undefined );
		} );

		it( 'should update country on countryList change', function() {
			let phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesListEmpty } /> );

			// Render again with filled country list
			phoneComponent = shallow( <FormPhoneInput countriesList={ mockCountriesList } /> );

			expect( phoneComponent.instance().getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );
	} );
} );
