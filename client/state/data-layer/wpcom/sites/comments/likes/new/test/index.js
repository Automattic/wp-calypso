/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { likeComment, updateCommentLikes, handleLikeFailure } from '../';
import { COMMENTS_LIKE, COMMENTS_UNLIKE, NOTICE_CREATE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

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
		expect( likeComment( action ) ).to.eql(
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

		expect( result ).to.eql(
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

		expect( result[ 0 ] ).to.eql(
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

		expect( result[ 1 ].type ).to.eql( NOTICE_CREATE );
		expect( result[ 1 ].notice.status ).to.eql( 'is-error' );
		expect( result[ 1 ].notice.text ).to.eql( 'Could not like this comment' );
	} );
} );
