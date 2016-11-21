/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	useFakeDom = require( 'test/helpers/use-fake-dom' ).withContainer,
	getContainer = require( 'test/helpers/use-fake-dom' ).getContainer,
	useMockery = require( 'test/helpers/use-mockery' );

describe( 'FormPhoneInput', function() {
	var React, ReactDom, ReactClass, TestUtils, i18n, mockCountriesList, mockCountriesListEmpty, FormPhoneInput, countries, container;

	useFakeDom();
	useMockery();

	before( function() {
		ReactDom = require( 'react-dom' );
		React = require( 'react' );
		ReactClass = require( 'react/lib/ReactClass' );
		TestUtils = require( 'react-addons-test-utils' );

		i18n = require( 'i18n-calypso' );
		mockCountriesList = require( './mocks/mock-countries-list' );
		mockCountriesListEmpty = require( './mocks/mock-countries-list-empty' );

		countries = mockCountriesList.get();

		ReactClass.injection.injectMixin( i18n.mixin );
		FormPhoneInput = require( 'components/forms/form-phone-input' );
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
