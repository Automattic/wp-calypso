/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, requesting } from '../reducer';
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'client/state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should insert a new suggestion', () => {
			const original = {
				124: [ { user_login: 'wordpress1' } ],
			};
			const newSuggestion = {
				user_login: 'wordpress2',
			};
			const state = items( original, {
				type: USER_SUGGESTIONS_RECEIVE,
				suggestions: [ newSuggestion ],
				siteId: 123,
			} );

			expect( state[ 123 ][ 0 ] ).to.eql( newSuggestion );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should index requesting state by site ID', () => {
			const siteId = 123;
			const state = requesting( undefined, {
				type: USER_SUGGESTIONS_REQUEST,
				siteId,
			} );
			expect( state ).to.eql( {
				123: true,
			} );
		} );

		test( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				124: false,
			} );
			const state = requesting( original, {
				type: USER_SUGGESTIONS_REQUEST,
				siteId: 123,
			} );
			expect( state ).to.eql( {
				124: false,
				123: true,
			} );
		} );

		test( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				124: false,
				123: true,
			} );
			const state = requesting( original, {
				type: USER_SUGGESTIONS_REQUEST_SUCCESS,
				siteId: 123,
			} );

			expect( state ).to.eql( {
				124: false,
				123: false,
			} );
		} );

		describe( 'persistence', () => {
			test( 'never persists state', () => {
				const original = deepFreeze( {
					124: false,
					123: true,
				} );
				const state = requesting( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			test( 'never loads persisted state', () => {
				const original = deepFreeze( {
					124: false,
					123: true,
				} );
				const state = requesting( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
