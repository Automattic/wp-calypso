/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { requestPostLikes } from '../actions';
import { POST_LIKES_REQUEST } from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'requestPostLikes()', () => {
		test( 'should return an action', () => {
			expect( requestPostLikes( 12345678, 50 ) ).toEqual( {
				type: POST_LIKES_REQUEST,
				siteId: 12345678,
				postId: 50,
			} );
		} );
	} );
} );
