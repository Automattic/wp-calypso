/** @jest-environment jsdom */
jest.mock( 'devdocs/service', () => ( {
	fetch: () => {}
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import SingleDocClass from '../doc';

describe( 'SingleDoc', () => {
	describe( 'makeSnip', () => {
		context( 'render test', () => {
			let renderedSingleDoc;

			beforeEach( () => {
				renderedSingleDoc = TestUtils.renderIntoDocument(
					<SingleDocClass path={ '/example' } term={ 'hello' } />
				);
			} );

			it( 'should render html with marked text', () => {
				renderedSingleDoc.setState( { body: '<div><p>something hello</p></div>' } );
				const html = ReactDom.findDOMNode( renderedSingleDoc.refs.body ).innerHTML;
				expect( html ).to.equal( '<div><p>something <mark>hello</mark></p></div>' );
			} );
		} );
	} );
} );
