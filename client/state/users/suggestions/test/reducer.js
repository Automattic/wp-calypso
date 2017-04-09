/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { items, requesting } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should insert a new suggestion', () => {
			const original = {
				124: [
					{ user_login: 'wordpress1' }
				]
			};
			const newSuggestion = {
				user_login: 'wordpress2',
			};
			const state = items( original, {
				type: USER_SUGGESTIONS_RECEIVE,
				suggestions: [ newSuggestion ],
				siteId: 123
			} );

			expect( state[ 123 ][ 0 ] ).to.eql( newSuggestion );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index requesting state by site ID', () => {
			const siteId = 123;
			const state = requesting( undefined, {
				type: USER_SUGGESTIONS_REQUEST,
				siteId,
			} );
			expect( state ).to.eql( {
				123: true
			} );
		} );

		it( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				124: false
			} );
			const state = requesting( original, {
				type: USER_SUGGESTIONS_REQUEST,
				siteId: 123
			} );
			expect( state ).to.eql( {
				124: false,
				123: true
			} );
		} );

		it( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				124: false,
				123: true
			} );
			const state = requesting( original, {
				type: USER_SUGGESTIONS_REQUEST_SUCCESS,
				siteId: 123
			} );

			expect( state ).to.eql( {
				124: false,
				123: false
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					124: false,
					123: true
				} );
				const state = requesting( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					124: false,
					123: true
				} );
				const state = requesting( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
