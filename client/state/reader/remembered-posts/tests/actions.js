/** @format */

/**
 * Internal dependencies
 */
import {
	READER_REMEMBERED_POSTS_REMEMBER,
	READER_REMEMBERED_POSTS_FORGET,
	READER_REMEMBERED_POSTS_UPDATE_STATUS,
} from 'state/action-types';
import {
	rememberPost,
	forgetPost,
	updateRememberedPostStatus,
} from 'state/reader/remembered-posts/actions';
import { READER_REMEMBERED_POSTS_STATUS } from 'state/reader/remembered-posts/status';

describe( 'actions', () => {
	describe( '#rememberPost', () => {
		test( 'should return an action when a post is remembered', () => {
			const action = rememberPost( { siteId: 123, postId: 456 } );
			expect( action ).toEqual( {
				type: READER_REMEMBERED_POSTS_REMEMBER,
				payload: { siteId: 123, postId: 456 },
			} );
		} );
	} );

	describe( '#forgetPost', () => {
		test( 'should return an action when a post is forgotten', () => {
			const action = forgetPost( { siteId: 123, postId: 456 } );
			expect( action ).toEqual( {
				type: READER_REMEMBERED_POSTS_FORGET,
				payload: { siteId: 123, postId: 456 },
			} );
		} );
	} );

	describe( '#updateRememberedPostStatus', () => {
		test( 'should return an action when a conversation follow status is updated', () => {
			const action = updateRememberedPostStatus( {
				siteId: 123,
				postId: 456,
				status: READER_REMEMBERED_POSTS_STATUS.remembered,
			} );
			expect( action ).toEqual( {
				type: READER_REMEMBERED_POSTS_UPDATE_STATUS,
				payload: { siteId: 123, postId: 456, status: READER_REMEMBERED_POSTS_STATUS.remembered },
			} );
		} );
	} );
} );
