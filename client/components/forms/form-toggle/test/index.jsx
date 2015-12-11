/**
 * External dependencies
 */
var assert = require( 'assert' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	unique = require( 'lodash/array/uniq' );

/**
 * Internal dependencies
 */
var FormToggle = require( 'components/forms/form-toggle' ),
	CompactFormToggle = require( 'components/forms/form-toggle/compact' );

require( 'lib/react-test-env-setup' )();

describe( 'CompactFormToggle', function() {
	describe( 'rendering', function() {
		it( 'should have is-compact class', function() {
			var toggle = TestUtils.renderIntoDocument( <CompactFormToggle /> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( toggleInput[ 0 ].getDOMNode().className.indexOf( 'is-compact' ) >= 0, 'is-compact class exists' );
		} );
	} );
} );

describe( 'FormToggle', function() {
	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( 'rendering', function() {
		it( 'should have form-toggle class', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle /> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
		} );

		it( 'should not have is-compact class', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle /> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'is-compact' );

			assert( 0 === toggleInput.length, 'no form toggle with is-compact class' );
		} );

		it( 'should be checked when checked is true', function() {
			[ true, false ].forEach( function( bool ) {
				var toggle = TestUtils.renderIntoDocument(
						<FormToggle
						checked={ bool }
						onChange={ function() {
							return;
						}
					}/> ),
					toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

				assert( 0 < toggleInput.length, 'a form toggle was rendered' );
				assert( bool === toggleInput[ 0 ].getDOMNode().checked, 'form toggle checked equals boolean' );
			} );
		} );

		it( 'should not be disabled when disabled is false', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle checked={ false } disabled={ false }/> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( false === toggleInput[ 0 ].getDOMNode().disabled, 'form toggle disabled equals boolean' );
		} );

		it( 'should be disabled when disabled is true', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle checked={ false } disabled={ true }/> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( true === toggleInput[ 0 ].getDOMNode().disabled, 'form toggle disabled equals boolean' );
		} );

		it( 'should have a label whose htmlFor matches the checkbox id', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle checked={ false } /> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle__switch' ),
				toggleLabel = TestUtils.scryRenderedDOMComponentsWithTag( toggle, 'label' );

			assert( toggleInput[ 0 ].getDOMNode().id === toggleLabel[ 0 ].getDOMNode().htmlFor );
		} );

		it( 'should create unique ids for each toggle', function() {
			var toggles = TestUtils.renderIntoDocument(
					<div>
						<FormToggle checked={ false } />
						<FormToggle checked={ false } />
						<FormToggle checked={ false } />
					</div>
				),
				toggleInputs = TestUtils.scryRenderedDOMComponentsWithClass( toggles, 'form-toggle' ),
				ids = toggleInputs.map( function( input ) {
					return input.getDOMNode().id;
				} );

			return ids.length === unique( ids ).length;
		} );
	} );
} );
