/* eslint-disable vars-on-top */

require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	TestUtils = React.addons.TestUtils,
	expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	mockCountriesList = require( './mock-countries-list' ),
	mockCountriesListEmpty = require( './mock-countries-list-empty' );

var countries = mockCountriesList.get();

describe( 'FormPhoneInput', function() {
	var FormPhoneInput;

	before( function() {
		i18n.initialize();
		ReactInjection.Class.injectMixin( i18n.mixin );
		FormPhoneInput = require( 'components/forms/form-phone-input' );
	} );

	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( 'getValue()', function() {
		it( 'should set country from props', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } initialCountryCode={ countries[ 1 ].code } />, document.body );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		it( 'should set country to first element when not specified', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } />, document.body );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );

		it( 'should update country on change', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } />, document.body ),
				select = TestUtils.findRenderedDOMComponentWithTag( phoneComponent, 'select' );

			TestUtils.Simulate.change( select.getDOMNode(), {
				target: {
					value: countries[ 1 ].code
				}
			} );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 1 ] );
		} );

		it( 'should have no country with empty countryList', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesListEmpty } />, document.body );

			expect( phoneComponent.getValue().countryData ).to.equal( undefined );
		} );

		it( 'should update country on countryList change', function() {
			var phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesListEmpty } />, document.body );

			// Render again with filled country list
			phoneComponent = ReactDom.render( <FormPhoneInput countriesList={ mockCountriesList } />, document.body );

			expect( phoneComponent.getValue().countryData ).to.deep.equal( countries[ 0 ] );
		} );
	} );
} );
