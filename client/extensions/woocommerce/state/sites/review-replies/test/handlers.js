/**
 * External dependencies
 */
/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
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
	handleReviewReplyCreate,
	handleReviewReplyCreateSuccess,
	announceCreateFailure,
} from '../handlers.js';
import reviewReplies from './fixtures/review-replies';
import { NOTICE_CREATE, WPCOM_HTTP_REQUEST } from 'calypso/state/action-types';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';
import {
	createReviewReply,
	deleteReviewReply,
	fetchReviewReplies,
	updateReviewReply,
} from 'woocommerce/state/sites/review-replies/actions';
import reviews from 'woocommerce/state/sites/reviews/test/fixtures/reviews';

describe( 'handlers', () => {
	describe( '#handleReviewRepliesRequest', () => {
		test( 'should dispatch a get action', () => {
			const siteId = '123';
			const reviewId = '555';
			const action = fetchReviewReplies( siteId, reviewId );
			const result = handleReviewRepliesRequest( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: `/wp/v2/comments&parent=${ reviewId }&order=asc&per_page=15&_method=GET`,
					json: true,
					apiVersion: '1.1',
				},
			} );
		} );
	} );
	describe( '#handleReviewsRequestSuccess()', () => {
		test( 'should dispatch review replies receive with list of replies', () => {
			const siteId = '123';
			const reviewId = '555';
			const response = { data: reviewReplies };

			const action = fetchReviewReplies( siteId, reviewId );
			const result = handleReviewRepliesRequestSuccess( action, response );

			expect( result ).toMatchObject( {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId,
				reviewId,
				replies: reviewReplies,
			} );
		} );
	} );
	describe( '#handleReviewRepliesRequestError()', () => {
		test( 'should dispatch error', () => {
			const siteId = '123';
			const reviewId = '555';
			const action = fetchReviewReplies( siteId, reviewId );
			const result = handleReviewRepliesRequestError( action, 'rest_no_route' );

			expect( result ).toMatchObject( {
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
		test( 'should dispatch a request', () => {
			const action = deleteReviewReply( siteId, reviewId, replyId );
			const result = handleDeleteReviewReply( action );
			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					json: true,
					apiVersion: '1.1',
				},
				body: {
					path: `/wp/v2/comments/${ replyId }&force=true&_method=DELETE`,
				},
			} );
		} );
	} );
	describe( '#announceDeleteSuccess', () => {
		const siteId = '123';
		test( 'should dispatch an action and success notice', () => {
			const action = deleteReviewReply( siteId, 544, 105 );
			const result = announceDeleteSuccess( action );

			expect( result[ 0 ] ).toMatchObject( {
				type: WOOCOMMERCE_REVIEW_REPLY_DELETED,
			} );
			expect( result[ 1 ] ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
	describe( '#announceDeleteFailure', () => {
		const siteId = '123';

		test( 'should dispatch an error', () => {
			const action = deleteReviewReply( siteId, 544, 105 );
			const result = announceDeleteFailure( action );

			expect( result ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
	describe( '#handleReviewReplyUpdate', () => {
		const siteId = '123';
		const reviewId = '105';
		const replyId = '106';
		const changes = { content: 'test' };

		test( 'should dispatch a request', () => {
			const action = updateReviewReply( siteId, reviewId, replyId, changes );
			const result = handleReviewReplyUpdate( action );

			expect( result ).toMatchObject( {
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
				},
			} );
		} );
	} );
	describe( '#handleReviewReplyUpdateSuccess', () => {
		const siteId = '123';

		test( 'should dispatch an action and success notice', () => {
			const action = updateReviewReply( siteId, 544, 105, { content: 'test' } );
			const result = handleReviewReplyUpdateSuccess( action, { content: 'test' } );

			expect( result[ 0 ] ).toMatchObject( {
				type: WOOCOMMERCE_REVIEW_REPLY_UPDATED,
			} );
			expect( result[ 2 ] ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );

	describe( '#announceReviewReplyUpdateFailure', () => {
		const siteId = '123';

		test( 'should dispatch an error', () => {
			const action = updateReviewReply( siteId, 544, 105, { content: 'test' } );
			const result = announceReviewReplyUpdateFailure( action );

			expect( result ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );

	describe( '#handleReviewReplyCreate', () => {
		const siteId = '123';
		const productId = '201';
		const reviewId = '105';

		test( 'should dispatch a request', () => {
			const action = createReviewReply( siteId, productId, reviewId, 'Hello world', false );
			const result = handleReviewReplyCreate( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				method: 'POST',
				path: `/sites/${ siteId }/comments/${ reviewId }/replies/new`,
				query: {
					apiVersion: '1.1',
				},
				body: {
					content: 'Hello world',
				},
			} );
		} );
	} );
	describe( '#handleReviewReplyCreateSuccess', () => {
		const siteId = '123';
		const productId = '201';
		const reviewId = '105';
		const create = { content: 'test', parent: 105, post: 201 };
		const getState = () => {
			return {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								reviews: {
									items: keyBy( reviews, 'id' ),
								},
							},
						},
					},
				},
			};
		};

		test( 'should dispatch an action', () => {
			const dispatch = jest.fn();
			const action = createReviewReply( siteId, productId, reviewId, 'Hello world', false );
			handleReviewReplyCreateSuccess( action, create )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
				} )
			);
			expect( dispatch ).not.toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				} )
			);
		} );

		test( 'should approve a review when requested', () => {
			const dispatch = jest.fn();
			const action = createReviewReply( siteId, productId, reviewId, 'Hello world', true );
			handleReviewReplyCreateSuccess( action, create )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				} )
			);
		} );
	} );

	describe( '#announceCreateFailure', () => {
		const siteId = '123';

		test( 'should dispatch an error', () => {
			const action = createReviewReply( siteId, 544, 105, 'Hello world', false );
			const result = announceCreateFailure( action );

			expect( result ).toMatchObject( {
				type: NOTICE_CREATE,
			} );
		} );
	} );
} );
