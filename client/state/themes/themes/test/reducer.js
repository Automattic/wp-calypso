/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';
import sinon from 'sinon';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	SERVER_DESERIALIZE
} from 'state/action-types';
import reducer, { initialState } from '../reducer';

describe( 'themes reducer', () => {
	describe( 'persistence', () => {
		before( () => {
			sinon.stub( console, 'warn' );
		} );
		after( () => {
			console.warn.restore();
		} );
		it( 'persists state and converts to a plain JS object', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( jsObject );
		} );
		it( 'loads persisted state and converts to immutable.js object', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );

		it( 'converts state from server to immutable.js object', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = reducer( jsObject, { type: SERVER_DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );

		it( 'should ignore loading data with invalid keys ', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				wrongkey: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );

		it( 'should ignore loading data with invalid values ', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: 'foo',
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );
	} );
} );
