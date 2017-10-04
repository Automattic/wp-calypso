/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import SingleDocClass from '../doc';

jest.mock( 'devdocs/service', () => ( {
	fetch: () => {},
} ) );

describe( 'SingleDoc', () => {
	describe( 'makeSnip', () => {
		describe( 'render test', () => {
			let renderedSingleDoc;

			beforeEach( () => {
				renderedSingleDoc = TestUtils.renderIntoDocument(
					<SingleDocClass path={ '/example' } term={ 'hello' } />
				);
			} );

			test( 'should render html with marked text', () => {
				renderedSingleDoc.setState( { body: '<div><p>something hello</p></div>' } );
				const html = ReactDom.findDOMNode( renderedSingleDoc.refs.body ).innerHTML;
				expect( html ).to.equal( '<div><p>something <mark>hello</mark></p></div>' );
			} );
		} );
	} );
} );
