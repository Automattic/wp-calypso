/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';
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

describe( 'themes-last-query reducer', () => {
	describe( 'persistence', () => {
		it( 'does not persist data because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
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
			expect( persistedState ).to.eql( {} );
		} );
		it( 'does not load persisted data because this is not implemented yet', () => {
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
			expect( state ).to.eql( initialState );
		} );

		it( 'converts state from server to immutable.js object', () => {
			const jsObject = deepFreeze( {
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
			const state = reducer( jsObject, { type: SERVER_DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );

		it.skip( 'should ignore loading data with invalid keys ', () => {
			const jsObject = deepFreeze( {
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
			const jsObject = deepFreeze( {
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
