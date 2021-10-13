/**
 * @jest-environment jsdom
 */

import { expect } from 'chai';
import { createElement } from 'react';
import TestUtils from 'react-dom/test-utils';
import sinon from 'sinon';
import searchClass from '../';

jest.mock( 'calypso/lib/analytics/ga', () => ( {} ) );

describe( 'Search', () => {
	describe( 'initialValue', () => {
		let onSearch;
		let rendered;

		beforeEach( () => {
			onSearch = sinon.stub();
		} );

		describe( 'with initialValue', () => {
			const initialValue = 'hello';

			beforeEach( () => {
				const searchElement = createElement( searchClass, {
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
				const searchElement = createElement( searchClass, {
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
