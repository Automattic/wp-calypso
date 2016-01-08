/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_RECEIVE,
	POSTS_RECEIVE,
} from 'state/action-types';
import {
	receivePost,
	receivePosts,
} from '../actions';

describe( 'actions', () => {
	describe( '#receivePost()', () => {
		it( 'should return an action object', () => {
			const post = { ID: 841, title: 'Hello World' };
			const action = receivePost( post );

			expect( action ).to.eql( {
				type: POST_RECEIVE,
				post
			} );
		} );
	} );

	describe( '#receivePosts()', () => {
		it( 'should return an action object', () => {
			const posts = [ { ID: 841, title: 'Hello World' } ];
			const action = receivePosts( posts );

			expect( action ).to.eql( {
				type: POSTS_RECEIVE,
				posts
			} );
		} );
	} );
} );
