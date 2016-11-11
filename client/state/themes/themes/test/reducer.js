/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';
import deepFreeze from 'deep-freeze';
import { Map } from 'immutable';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	SERVER_DESERIALIZE,
	THEMES_RECEIVE,
} from 'state/action-types';
import reducer, { initialState } from '../reducer';

describe( 'themes reducer', () => {
	describe( 'persistence', () => {
		it( 'does not persist state because this is not implemented yet', () => {
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
			expect( persistedState ).to.eql( {} );
		} );
		it( 'does not load persisted state because this is not implemented yet', () => {
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
			expect( state ).to.eql( initialState );
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
	} );

	describe( 'themes received', () => {
		const siteId = 12345678;
		const twentyfifteen = Map( {
			name: 'Twenty Fifteen',
			id: 'twentyfifteen'
		} );
		const twentysixteen = {
			name: 'Twenty Sixteen',
			id: 'twentysixteen'
		};
		const state = fromJS( {
			themes: {
				twentyfifteen
			},
			siteId: 87654321
		} );
		const newState = reducer( state, {
			type: THEMES_RECEIVE,
			themes: [
				twentysixteen
			],
			siteId: siteId
		} );

		it( 'adds newly received themes to existing themes state', () => {
			expect( newState.getIn( [ 'themes', 'twentysixteen' ] ).toJS() ).to.eql( twentysixteen );
			expect( newState.get( 'themes' ).size ).to.eql( 2 );
		} );

		it( 'sets the currentSiteId', () => {
			expect( newState.get( 'currentSiteId' ) ).to.eql( siteId );
		} );
	} );
} );
