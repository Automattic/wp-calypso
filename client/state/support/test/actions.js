/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SUPPORT_USER_TOKEN_FETCH } from 'client/state/action-types';
import { supportUserTokenFetch } from '../actions';

describe( 'actions', () => {
	describe( '#supportUserFetchToken()', () => {
		test( 'should return fetch action object', () => {
			expect( supportUserTokenFetch( 'notarealuser' ) ).to.deep.equal( {
				type: SUPPORT_USER_TOKEN_FETCH,
				supportUser: 'notarealuser',
			} );
		} );
	} );
} );
