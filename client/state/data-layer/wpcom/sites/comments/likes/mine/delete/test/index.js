/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { unlikeComment, updateCommentLikes, handleUnlikeFailure } from '../';
import { COMMENTS_UNLIKE, COMMENTS_LIKE, NOTICE_CREATE } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const SITE_ID = 77203074;
const POST_ID = 287;

describe( '#unlikeComment()', () => {
	const action = {
		type: COMMENTS_UNLIKE,
		siteId: SITE_ID,
		postId: POST_ID,
		commentId: 1,
	};

	it( 'should dispatch a http action to remove a comment like', () => {
		const dispatch = spy();
		unlikeComment( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: `/sites/${ SITE_ID }/comments/1/likes/mine/delete`,
				},
				action,
			),
		);
	} );
} );

describe( '#updateCommentLikes()', () => {
	it( 'should dispatch a comment like update action', () => {
		const dispatch = spy();

		updateCommentLikes( { dispatch }, { siteId: SITE_ID, postId: POST_ID, commentId: 1 }, {
			like_count: 4,
		} );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			bypassDataLayer( {
				type: COMMENTS_UNLIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
				like_count: 4,
			} ),
		);
	} );
} );

describe( '#handleUnlikeFailure()', () => {
	it( 'should dispatch an like action to rollback optimistic update', () => {
		const dispatch = spy();

		handleUnlikeFailure( { dispatch }, { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			bypassDataLayer( {
				type: COMMENTS_LIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} ),
		);
	} );

	it( 'should dispatch an error notice', () => {
		const dispatch = spy();

		handleUnlikeFailure( { dispatch }, { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWithMatch( {
			type: NOTICE_CREATE,
			notice: {
				status: 'is-error',
				text: 'Could not unlike this comment',
			},
		} );
	} );
} );
