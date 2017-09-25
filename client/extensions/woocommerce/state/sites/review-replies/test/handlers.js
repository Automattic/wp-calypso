/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { handleReviewRepliesRequest, handleReviewRepliesRequestSuccess, handleReviewRepliesRequestError } from '../handlers.js';
import reviewReplies from './fixtures/review-replies';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { WOOCOMMERCE_REVIEW_REPLIES_UPDATED } from 'woocommerce/state/action-types';
import { fetchReviewReplies } from 'woocommerce/state/sites/review-replies/actions';

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
} );
