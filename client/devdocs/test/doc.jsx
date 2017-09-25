/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'SingleDoc', () => {
	let React, ReactDom, TestUtils, SingleDocClass;
	let fetchResponse = '';

	useFakeDom();
	useMockery( mockery => {
		mockery.registerMock( './service', {
			fetch( path, cb ) {
				cb( fetchResponse );
			}
		}	);
	} );

	before( () => {
		React = require( 'react' );
		ReactDom = require( 'react-dom' );
		TestUtils = require( 'react-addons-test-utils' );

		SingleDocClass = require( '../doc.jsx' );
	} );

	describe( 'makeSnip', () => {
		context( 'render test', () => {
			let renderedSingleDoc;

			beforeEach( () => {
				fetchResponse = '<div><p>something hello</p></div>';
				renderedSingleDoc = TestUtils.renderIntoDocument(
					<SingleDocClass path={ '/example' } term={ 'hello' } />
				);
			} );

			it( 'should render html with marked text', () => {
				renderedSingleDoc.setState( { body: fetchResponse } );
				const html = ReactDom.findDOMNode( renderedSingleDoc.refs.body ).innerHTML;
				expect( html ).to.equal( '<div><p>something <mark>hello</mark></p></div>' );
			} );
		} );
	} );
} );
