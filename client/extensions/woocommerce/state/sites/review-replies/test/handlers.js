/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchReviewReplies,
	deleteReviewReply,
	updateReviewReply,
} from 'woocommerce/state/sites/review-replies/actions';
import {
	handleDeleteReviewReply,
	announceDeleteSuccess,
	announceDeleteFailure,
	handleReviewRepliesRequest,
	handleReviewRepliesRequestSuccess,
	handleReviewRepliesRequestError,
	handleReviewReplyUpdate,
	handleReviewReplyUpdateSuccess,
	announceReviewReplyUpdateFailure,
} from '../handlers.js';
import reviewReplies from './fixtures/review-replies';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
} from 'woocommerce/state/action-types';
import { NOTICE_CREATE } from 'state/action-types';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

describe( 'handlers', () => {
	describe( '#handleReviewRepliesRequest', () => {
		it( 'should dispatch a get action', () => {
			const siteId = '123';
			const reviewId = '555';
			const dispatch = spy();
			const action = fetchReviewReplies( siteId, reviewId );
			handleReviewRepliesRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: `/wp/v2/comments&parent=${ reviewId }&per_page=15&_method=GET`,
					json: true,
					apiVersion: '1.1',
				}
			} ) );
		} );
	} );
	describe( '#handleReviewsRequestSuccess()', () => {
		it( 'should dispatch review replies receive with list of replies', () => {
			const siteId = '123';
			const reviewId = '555';
			const store = {
				dispatch: spy(),
			};
			const response = { data: reviewReplies };

			const action = fetchReviewReplies( siteId, reviewId );
			handleReviewRepliesRequestSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId,
				reviewId,
				replies: reviewReplies,
			} );
		} );
	} );
	describe( '#handleReviewRepliesRequestError()', () => {
		it( 'should dispatch error', () => {
			const siteId = '123';
			const reviewId = '555';
			const store = {
				dispatch: spy(),
			};

			const action = fetchReviewReplies( siteId, reviewId );
			handleReviewRepliesRequestError( store, action, 'rest_no_route' );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId,
				reviewId,
				error: 'rest_no_route',
			} );
		} );
	} );
	describe( '#handleDeleteReviewReply', () => {
		const siteId = '123';
		const reviewId = '105';
		const replyId = '106';
		it( 'should dispatch a request', () => {
			const dispatch = spy();
			const action = deleteReviewReply( siteId, reviewId, replyId );
			handleDeleteReviewReply( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					json: true,
					apiVersion: '1.1',
				},
				body: {
					path: `/wp/v2/comments/${ replyId }&force=true&_method=DELETE`,
				}
			} ) );
		} );
	} );
	describe( '#announceDeleteSuccess', () => {
		const siteId = '123';
		it( 'should dispatch an action and success notice', () => {
			const dispatch = spy();
			const action = deleteReviewReply( siteId, 544, 105 );
			announceDeleteSuccess( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_REVIEW_REPLY_DELETED,
			} ) );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: NOTICE_CREATE,
			} ) );
		} );
	} );
	describe( '#announceDeleteFailure', () => {
		const siteId = '123';
		const dispatch = spy();
		it( 'should dispatch an error', () => {
			const action = deleteReviewReply( siteId, 544, 105 );
			announceDeleteFailure( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: NOTICE_CREATE,
			} ) );
		} );
	} );
	describe( '#handleReviewReplyUpdate', () => {
		const siteId = '123';
		const reviewId = '105';
		const replyId = '106';
		const changes = { content: 'test' };
		it( 'should dispatch a request', () => {
			const dispatch = spy();
			const action = updateReviewReply( siteId, reviewId, replyId, changes );
			handleReviewReplyUpdate( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					json: true,
					apiVersion: '1.1',
				},
				body: {
					path: `/wp/v2/comments/${ replyId }&_method=POST`,
					body: JSON.stringify( changes ),
				}
			} ) );
		} );
	} );
	describe( '#handleReviewReplyUpdateSuccess', () => {
		const siteId = '123';
		it( 'should dispatch an action and success notice', () => {
			const dispatch = spy();
			const action = updateReviewReply( siteId, 544, 105, { content: 'test' } );
			handleReviewReplyUpdateSuccess( { dispatch }, action, { content: 'test' } );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: WOOCOMMERCE_REVIEW_REPLY_UPDATED,
			} ) );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: NOTICE_CREATE,
			} ) );
		} );
	} );
	describe( '#announceReviewReplyUpdateFailure', () => {
		const siteId = '123';
		const dispatch = spy();
		it( 'should dispatch an error', () => {
			const action = updateReviewReply( siteId, 544, 105, { content: 'test' } );
			announceReviewReplyUpdateFailure( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith( match( {
				type: NOTICE_CREATE,
			} ) );
		} );
	} );
} );
