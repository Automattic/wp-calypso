/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { initialState } from '../reducer';

describe( 'themes-last-query reducer', () => {
	describe( 'persistence', () => {
		it( 'persists state and converts to a plain JS object', () => {
			const jsObject = Object.freeze( {
				currentSiteId: 12345678,
				previousSiteId: 2123982,
				isJetpack: false,
				lastParams: {
					search: 'foo bar',
					tier: 'all',
					page: 0,
					perPage: 20
				}
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( jsObject );
		} );
		it( 'loads valid persisted state and converts to immutable.js object', () => {
			const jsObject = Object.freeze( {
				currentSiteId: 12345678,
				previousSiteId: 2123982,
				isJetpack: false,
				lastParams: {
					search: 'foo bar',
					tier: 'all',
					page: 0,
					perPage: 20
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );

		it.skip( 'should ignore loading data with invalid keys ', () => {
			const jsObject = Object.freeze( {
				currentSiteId: 12345678,
				wrongkey: 2123982,
				isJetpack: false,
				lastParams: {
					search: 'foo bar',
					tier: 'all',
					page: 0,
					perPage: 20
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );

		it.skip( 'should ignore loading data with invalid values ', () => {
			const jsObject = Object.freeze( {
				currentSiteId: 12345678,
				previousSiteId: 2123982,
				isJetpack: false,
				lastParams: {
					search: 'foo bar',
					tier: 'unknown tier',
					page: 0,
					perPage: 20
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );
	} );
} );
