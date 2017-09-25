/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { supportUserTokenFetch } from '../actions';
import { SUPPORT_USER_TOKEN_FETCH } from 'state/action-types';

describe( 'actions', () => {
	describe( '#supportUserFetchToken()', () => {
		it( 'should return fetch action object', () => {
			expect( supportUserTokenFetch( 'notarealuser' ) )
				.to.deep.equal( {
					type: SUPPORT_USER_TOKEN_FETCH,
					supportUser: 'notarealuser',
				} );
		} );
	} );
} );
