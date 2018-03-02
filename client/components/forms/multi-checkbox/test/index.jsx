/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import MultiCheckbox from '../';

describe( 'index', () => {
	var options = [ { value: 1, label: 'One' }, { value: 2, label: 'Two' } ];

	afterEach( () => {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( 'rendering', () => {
		test( 'should render a set of checkboxes', () => {
			var checkboxes = TestUtils.renderIntoDocument(
					<MultiCheckbox name="favorite_colors" options={ options } />
				),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.equal( options.length, labels.length );
			labels.forEach( function( label, i ) {
				var labelNode = label,
					inputNode = labelNode.querySelector( 'input' );
				assert.equal( 'favorite_colors[]', inputNode.name );
				assert.equal( options[ i ].value, inputNode.value );
				assert.equal( options[ i ].label, labelNode.textContent );
			} );
		} );

		test( 'should accept an array of checked values', () => {
			var checkboxes = TestUtils.renderIntoDocument(
					<MultiCheckbox
						name="favorite_colors"
						options={ options }
						checked={ [ options[ 0 ].value ] }
					/>
				),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.equal( true, labels[ 0 ].querySelector( 'input' ).checked );
			assert.equal( false, labels[ 1 ].querySelector( 'input' ).checked );
		} );

		test( 'should accept an array of defaultChecked', () => {
			var checkboxes = TestUtils.renderIntoDocument(
					<MultiCheckbox
						name="favorite_colors"
						options={ options }
						defaultChecked={ [ options[ 0 ].value ] }
					/>
				),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.equal( true, labels[ 0 ].querySelector( 'input' ).checked );
			assert.equal( false, labels[ 1 ].querySelector( 'input' ).checked );
		} );

		test( 'should accept an onChange event handler', done => {
			var checkboxes = TestUtils.renderIntoDocument(
					<MultiCheckbox name="favorite_colors" options={ options } onChange={ finishTest } />
				),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			TestUtils.Simulate.change( labels[ 0 ].querySelector( 'input' ), {
				target: {
					value: options[ 0 ].value,
					checked: true,
				},
			} );

			function finishTest( event ) {
				assert.deepEqual( [ options[ 0 ].value ], event.value );
				done();
			}
		} );

		test( 'should accept a disabled boolean', () => {
			var checkboxes = TestUtils.renderIntoDocument(
					<MultiCheckbox name="favorite_colors" options={ options } disabled={ true } />
				),
				labels = TestUtils.scryRenderedDOMComponentsWithTag( checkboxes, 'label' );

			assert.ok( labels[ 0 ].querySelector( 'input' ).disabled );
			assert.ok( labels[ 1 ].querySelector( 'input' ).disabled );
		} );

		test( 'should transfer props to the rendered element', () => {
			var className = 'transferred-class',
				checkboxes = TestUtils.renderIntoDocument(
					<MultiCheckbox name="favorite_colors" options={ options } className={ className } />
				),
				div = TestUtils.findRenderedDOMComponentWithTag( checkboxes, 'div' );

			assert.notEqual( -1, div.className.indexOf( className ) );
		} );
	} );
} );
