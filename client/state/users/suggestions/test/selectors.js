/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getUserSuggestions,
	isRequestingUserSuggestions
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getUserSuggestions()', () => {
		it( 'should return empty array if there is no suggestion available', () => {
			const state = {
				users: {
					suggestions: {
						items: {}
					}
				}
			};
			expect( getUserSuggestions( state, 123 ) ).to.eql( [] );
		} );

		it( 'should return suggestions if they exist for a site ID', () => {
			const firstSuggestion = { user_login: 'wordpress1' };
			const secondSuggestion = { user_login: 'wordpress2' };
			const state = {
				users: {
					suggestions: {
						items: {
							123: [
								firstSuggestion,
								secondSuggestion
							]
						}
					}
				}
			};
			expect( getUserSuggestions( state, 123 ) ).to.have.length( 2 );
		} );
	} );

	describe( '#isRequestingUserSuggestions()', () => {
		it( 'should return true if requesting suggestions for the specified site', () => {
			const state = {
				users: {
					suggestions: {
						requesting: {
							123: true,
							124: false,
						}
					}
				}
			};
			expect( isRequestingUserSuggestions( state, 123 ) ).to.equal( true );
			expect( isRequestingUserSuggestions( state, 124 ) ).to.equal( false );
		} );
	} );
} );
