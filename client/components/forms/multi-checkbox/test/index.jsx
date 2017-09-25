/**
 * External dependencies
 */
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import MultiCheckbox from '../';
import assert from 'assert';

describe( 'index', function() {
	const options = [
		{ value: 1, label: 'One' },
		{ value: 2, label: 'Two' }
	];
	require( 'test/helpers/use-fake-dom' )();

	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( 'rendering', function() {
		it( 'should render a set of checkboxes', function() {
			let checkboxes = TestUtils.renderIntoDocument( <MultiCheckbox name="favorite_colors" options={ options } /> ),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.equal( options.length, labels.length );
			labels.forEach( function( label, i ) {
				let labelNode = label,
					inputNode = labelNode.querySelector( 'input' );
				assert.equal( 'favorite_colors[]', inputNode.name );
				assert.equal( options[ i ].value, inputNode.value );
				assert.equal( options[ i ].label, labelNode.textContent );
			} );
		} );

		it( 'should accept an array of checked values', function() {
			let checkboxes = TestUtils.renderIntoDocument( <MultiCheckbox name="favorite_colors" options={ options } checked={ [ options[ 0 ].value ] } /> ),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.equal( true, labels[ 0 ].querySelector( 'input' ).checked );
			assert.equal( false, labels[ 1 ].querySelector( 'input' ).checked );
		} );

		it( 'should accept an array of defaultChecked', function() {
			let checkboxes = TestUtils.renderIntoDocument( <MultiCheckbox name="favorite_colors" options={ options } defaultChecked={ [ options[ 0 ].value ] } /> ),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.equal( true, labels[ 0 ].querySelector( 'input' ).checked );
			assert.equal( false, labels[ 1 ].querySelector( 'input' ).checked );
		} );

		it( 'should accept an onChange event handler', function( done ) {
			let checkboxes = TestUtils.renderIntoDocument( <MultiCheckbox name="favorite_colors" options={ options } onChange={ finishTest } /> ),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			TestUtils.Simulate.change( labels[ 0 ].querySelector( 'input' ), {
				target: {
					value: options[ 0 ].value,
					checked: true
				}
			} );

			function finishTest( event ) {
				assert.deepEqual( [ options[ 0 ].value ], event.value );
				done();
			}
		} );

		it( 'should accept a disabled boolean', function() {
			let checkboxes = TestUtils.renderIntoDocument( <MultiCheckbox name="favorite_colors" options={ options } disabled={ true } /> ),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.ok( labels[ 0 ].querySelector( 'input' ).disabled );
			assert.ok( labels[ 1 ].querySelector( 'input' ).disabled );
		} );

		it( 'should transfer props to the rendered element', function() {
			let className = 'transferred-class',
				checkboxes = TestUtils.renderIntoDocument( <MultiCheckbox name="favorite_colors" options={ options } className={ className } /> ),
				div = TestUtils.findRenderedDOMComponentWithTag( checkboxes, 'div' );

			assert.notEqual( -1, div.className.indexOf( className ) );
		} );
	} );
} );
