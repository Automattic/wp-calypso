/**
 * External dependencies
 */
import assert from 'assert';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';
import { uniq } from 'lodash';

/**
 * Internal dependencies
 */
import FormToggle from '../';
import CompactFormToggle from '../compact';

/**
 * Module variables
 */

const Wrapper = ( { children } ) => (
  <div>{ children }</div>
);

describe( 'index', function() {
	describe( 'rendering', function() {
		it( 'should have is-compact class', function() {
			const toggle = shallow( <CompactFormToggle /> );
			assert( toggle.hasClass( 'is-compact' ) );
		} );
	} );
} );

describe( 'FormToggle', function() {
	require( 'test/helpers/use-fake-dom' )();
	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( 'rendering', function() {
		it( 'should have form-toggle class', function() {
			const toggle = shallow( <FormToggle /> );
			assert( toggle.find( '.form-toggle' ).length === 1 );
		} );

		it( 'should not have is-compact class', function() {
			const toggle = shallow( <FormToggle /> );
			assert( toggle.find( '.is-compact' ).length === 0 );
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
				assert( bool === toggleInput[ 0 ].checked, 'form toggle checked equals boolean' );
			} );
		} );

		it( 'should fire onChange event with value param when clicked', function( done ) {
			const toggle = TestUtils.renderIntoDocument(
				<FormToggle
					checked={ false }
					onChange={ function( checked ) {
						assert( checked, 'onChange handler was called with a value param' );
						done();
					} }
				/>,
			);

			TestUtils.Simulate.click(
				ReactDom.findDOMNode(
					TestUtils.findRenderedDOMComponentWithClass( toggle, 'form-toggle__switch' ),
				),
			);
		} );

		it( 'should not be disabled when disabled is false', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle checked={ false } disabled={ false }/> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( false === toggleInput[ 0 ].disabled, 'form toggle disabled equals boolean' );
		} );

		it( 'should be disabled when disabled is true', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle checked={ false } disabled={ true }/> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( true === toggleInput[ 0 ].disabled, 'form toggle disabled equals boolean' );
		} );

		it( 'should have a label whose htmlFor matches the checkbox id', function() {
			var toggle = TestUtils.renderIntoDocument( <FormToggle checked={ false } /> ),
				toggleInput = TestUtils.scryRenderedDOMComponentsWithClass( toggle, 'form-toggle__switch' ),
				toggleLabel = TestUtils.scryRenderedDOMComponentsWithTag( toggle, 'label' );

			assert( toggleInput[ 0 ].id === toggleLabel[ 0 ].htmlFor );
		} );

		it( 'should create unique ids for each toggle', function() {
			var toggles = TestUtils.renderIntoDocument(
					<Wrapper>
						<FormToggle checked={ false } />
						<FormToggle checked={ false } />
						<FormToggle checked={ false } />
					</Wrapper>
				),
				toggleInputs = TestUtils.scryRenderedDOMComponentsWithClass( toggles, 'form-toggle' ),
				ids = toggleInputs.map( function( input ) {
					return input.id;
				} );

			return ids.length === uniq( ids ).length;
		} );
	} );
} );
