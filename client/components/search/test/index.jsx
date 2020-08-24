/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import searchClass from '../';

jest.mock( 'lib/analytics/ga', () => ( {} ) );
jest.mock( 'gridicons', () => require( 'components/empty-component' ) );

describe( 'Search', () => {
	describe( 'initialValue', () => {
		let onSearch, rendered;

		beforeEach( () => {
			onSearch = sinon.stub();
		} );

		describe( 'with initialValue', () => {
			const initialValue = 'hello';

			beforeEach( () => {
				const searchElement = React.createElement( searchClass, {
					initialValue,
					onSearch,
				} );
				rendered = TestUtils.renderIntoDocument( searchElement );
			} );

			test( 'should set state.keyword with the initialValue after mount', () => {
				expect( rendered.state.keyword ).to.equal( initialValue );
			} );
		} );

		describe( 'without initialValue', () => {
			beforeEach( () => {
				const searchElement = React.createElement( searchClass, {
					onSearch,
				} );
				rendered = TestUtils.renderIntoDocument( searchElement );
			} );

			test( 'should set state.keyword empty string after mount', () => {
				expect( rendered.state.keyword ).to.equal( '' );
			} );
		} );
	} );
} );
