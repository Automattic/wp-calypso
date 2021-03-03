/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getUserSuggestions, isRequestingUserSuggestions } from '../selectors';

describe( 'selectors', () => {
	describe( '#getUserSuggestions()', () => {
		test( 'should return empty array if there is no suggestion available', () => {
			const state = {
				userSuggestions: {
					items: {},
				},
			};
			expect( getUserSuggestions( state, 123 ) ).to.eql( [] );
		} );

		test( 'should return suggestions if they exist for a site ID', () => {
			const firstSuggestion = { user_login: 'wordpress1' };
			const secondSuggestion = { user_login: 'wordpress2' };
			const state = {
				userSuggestions: {
					items: {
						123: [ firstSuggestion, secondSuggestion ],
					},
				},
			};
			expect( getUserSuggestions( state, 123 ) ).to.have.length( 2 );
		} );
	} );

	describe( '#isRequestingUserSuggestions()', () => {
		test( 'should return true if requesting suggestions for the specified site', () => {
			const state = {
				userSuggestions: {
					requesting: {
						123: true,
						124: false,
					},
				},
			};
			expect( isRequestingUserSuggestions( state, 123 ) ).to.equal( true );
			expect( isRequestingUserSuggestions( state, 124 ) ).to.equal( false );
		} );
	} );
} );
