/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { COMMENTS_LIKE, COMMENTS_UNLIKE, NOTICE_CREATE } from 'state/action-types';
import { likeComment, updateCommentLikes, handleLikeFailure } from '../';
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
	it( 'should dispatch a http action to create a new like', () => {
		const dispatch = spy();

		likeComment( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
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
	it( 'should dispatch a comment like update action', () => {
		const dispatch = spy();

		updateCommentLikes(
			{ dispatch },
			{ siteId: SITE_ID, postId: POST_ID, commentId: 1 },
			{
				like_count: 4,
			}
		);

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
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
	it( 'should dispatch an unlike action to rollback optimistic update', () => {
		const dispatch = spy();

		handleLikeFailure( { dispatch }, { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			bypassDataLayer( {
				type: COMMENTS_UNLIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} )
		);
	} );

	it( 'should dispatch an error notice', () => {
		const dispatch = spy();

		handleLikeFailure( { dispatch }, { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWithMatch( {
			type: NOTICE_CREATE,
			notice: {
				status: 'is-error',
				text: 'Could not like this comment',
			},
		} );
	} );
} );
