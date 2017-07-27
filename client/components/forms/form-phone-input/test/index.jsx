/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';
import { withContainer as useFakeDom } from 'test/helpers/use-fake-dom';
import { getContainer } from 'test/helpers/use-fake-dom';

/**
 * Internal dependencies
 */
import { FormPhoneInput } from '../';
import mockCountriesList from './mocks/mock-countries-list';
import mockCountriesListEmpty from './mocks/mock-countries-list-empty';

const countries = mockCountriesList.get();

describe( 'FormPhoneInput', function() {
	var container;

	useFakeDom();

	before( function() {
		container = getContainer();
	} );

	afterEach( function() {
		ReactDom.unmountComponentAtNode( container );
	} );

	describe( 'getValue()', function() {
		it( 'should set country from props', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } initialCountryCode={ countries[ 1 ].code } />, container );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		it( 'should set country to first element when not specified', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } />, container );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );

		it( 'should update country on change', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } />, container ),
				select = TestUtils.findRenderedDOMComponentWithTag( phoneComponent, 'select' );

			TestUtils.Simulate.change( select, {
				target: {
					value: countries[ 1 ].code
				}
			} );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		it( 'should have no country with empty countryList', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesListEmpty } />, container );

			expect( phoneComponent.getValue().countryData ).to.equal( undefined );
		} );

		it( 'should update country on countryList change', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesListEmpty } />, container );

			// Render again with filled country list
			phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } />, container );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );
	} );
} );
