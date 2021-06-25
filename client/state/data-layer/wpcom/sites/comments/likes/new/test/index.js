/**
 * External dependencies
 */
import { likeComment, updateCommentLikes, handleLikeFailure } from '../';
import { COMMENTS_LIKE, COMMENTS_UNLIKE, NOTICE_CREATE } from 'calypso/state/action-types';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const SITE_ID = 91750058;
const POST_ID = 287;
const action = {
	type: COMMENTS_LIKE,
	siteId: SITE_ID,
	postId: POST_ID,
	commentId: 1,
};

describe( '#likeComment()', () => {
	test( 'should dispatch a http action to create a new like', () => {
		expect( likeComment( action ) ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: `/sites/${ SITE_ID }/comments/1/likes/new`,
				},
				action
			)
		);
	} );
} );

describe( '#updateCommentLikes()', () => {
	test( 'should dispatch a comment like update action', () => {
		const result = updateCommentLikes(
			{ siteId: SITE_ID, postId: POST_ID, commentId: 1 },
			{
				like_count: 4,
			}
		);

		expect( result ).toEqual(
			bypassDataLayer( {
				type: COMMENTS_LIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
				like_count: 4,
			} )
		);
	} );
} );

describe( '#handleLikeFailure()', () => {
	test( 'should dispatch an unlike action to rollback optimistic update', () => {
		const result = handleLikeFailure( { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

		expect( result[ 0 ] ).toEqual(
			bypassDataLayer( {
				type: COMMENTS_UNLIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} )
		);
	} );

	test( 'should dispatch an error notice', () => {
		const result = handleLikeFailure( { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

		expect( result[ 1 ] ).toEqual(
			expect.objectContaining( {
				type: NOTICE_CREATE,
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'Could not like this comment',
				} ),
			} )
		);
	} );
} );
