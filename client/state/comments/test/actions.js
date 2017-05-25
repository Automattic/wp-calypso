/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from 'config';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	COMMENTS_RECEIVE,
	COMMENTS_REMOVE,
	COMMENTS_REQUEST,
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE
} from '../../action-types';
import {
	requestPostComments,
	writeComment,
	removeComment,
	likeComment,
	unlikeComment
} from '../actions';
import {
	NUMBER_OF_COMMENTS_PER_FETCH
} from '../constants';

const SITE_ID = 91750058;
const POST_ID = 287;
const API_DOMAIN = 'https://public-api.wordpress.com:443';

describe( 'actions', () => {
	after( () => {
		nock.cleanAll();
	} );

	describe( '#requestPostComments()', () => {
		useSandbox( ( sandbox ) => {
			sandbox.stub( config, 'isEnabled' ).withArgs( 'comments/filters-in-posts' ).returns( true );
		} );

		it( 'should return a comment request action', function() {
			const action = requestPostComments( SITE_ID, POST_ID, 'trash', new Date( '2017-05-25T21:41:25.841Z' ) );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
					before: '2017-05-25T21:41:25.841Z'
				}
			} );
		} );

		it( 'should return a comment request action with a default status of approved', function() {
			const action = requestPostComments( SITE_ID, POST_ID, undefined, new Date( '2017-05-25T21:41:25.841Z' ) );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'approved',
					before: '2017-05-25T21:41:25.841Z'
				}
			} );
		} );

		it( 'should return a comment request action with no before filter if none provided', function() {
			const action = requestPostComments( SITE_ID, POST_ID, undefined, null );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'approved',
				}
			} );
		} );
	} );

	describe( '#writeComment()', () => {
		before( () => {
			nock( API_DOMAIN )
				.post( `/rest/v1.1/sites/${ SITE_ID }/posts/${ POST_ID }/replies/new`, { content: 'hi' } )
				.reply( 200,
				{
					ID: 13,
					post: {
						ID: POST_ID,
						title: 'My awesome post!',
						type: 'post',
					},
					author: { ID: 1234 },
					date: '2016-02-05T11:17:03+00:00',
					content: '<p>hi<\/p>\n',
					status: 'approved',
					parent: false,
					type: 'comment'
				} );
		} );

		it( 'should dispatch correct actions', function() {
			const dispatchSpy = sinon.spy();
			const writeCommentThunk = writeComment( 'hi', SITE_ID, POST_ID );

			const reqPromise = writeCommentThunk( dispatchSpy );

			const firstSpyCallArg = dispatchSpy.args[ 0 ][ 0 ];

			expect( firstSpyCallArg.type ).to.eql( COMMENTS_RECEIVE );
			expect( firstSpyCallArg.comments[ 0 ].ID.indexOf( 'placeholder-' ) ).to.equal( 0 );

			return reqPromise.then( ( comment ) => {
				expect( comment ).to.be.object;
				expect( comment ).to.not.equal( undefined );
				expect( comment ).to.not.equal( null );

				const secondSpyCallArg = dispatchSpy.args[ 1 ][ 0 ];
				const thirdSpyCallArg = dispatchSpy.args[ 2 ][ 0 ];

				expect( secondSpyCallArg.type ).to.eql( COMMENTS_REMOVE );
				expect( secondSpyCallArg.commentId.indexOf( 'placeholder-' ) ).to.equal( 0 );

				expect( thirdSpyCallArg.type ).to.eql( COMMENTS_RECEIVE );
				expect( thirdSpyCallArg.comments.length ).to.eql( 1 );
				expect( thirdSpyCallArg.comments[ 0 ].ID ).to.be.a.number;
			} );
		} );
	} ); // writeComment

	describe( '#removeComment()', () => {
		it( 'should dispatch remove for a placeholder when provided', () => {
			const removeCommentAction = removeComment( SITE_ID, POST_ID, 'placeholder-123' );

			expect( removeCommentAction.type ).to.eql( COMMENTS_REMOVE );
			expect( removeCommentAction.commentId ).to.equal( 'placeholder-123' );
		} );
	} );

	describe( '#likeComment()', () => {
		it( 'should dispatch correct action when request fails', () => {
			const likeThunk = likeComment( 1, 1, 1 );
			const dispatchSpy = sinon.spy();

			const apiPromise = likeThunk( dispatchSpy );

			expect( dispatchSpy ).to.be.calledWith( {
				type: COMMENTS_LIKE,
				siteId: 1,
				postId: 1,
				commentId: 1
			} );

			// since we didn't mock the request and we have disabled requests
			// we expect this to fail an revert the optimistic update
			return apiPromise.then( () => {
				expect( dispatchSpy ).to.be.calledWith( {
					type: COMMENTS_UNLIKE,
					siteId: 1,
					postId: 1,
					commentId: 1
				} );
			} );
		} );

		it( 'should dispatch correct action when request succeed', () => {
			const dispatchSpy = sinon.spy();

			nock( API_DOMAIN )
				.post( '/rest/v1.1/sites/1/comments/1/likes/new', {
					source: 'reader'
				} )
				.reply( 200, {
					success: true,
					i_like: true,
					like_count: 123
				} );

			const likeThunk = likeComment( 1, 1, 1 );
			const apiPromise = likeThunk( dispatchSpy );

			expect( dispatchSpy ).to.be.calledWith( {
				type: COMMENTS_LIKE,
				siteId: 1,
				postId: 1,
				commentId: 1
			} );

			// since we didn't mock the request and we have disabled requests
			// we expect this to fail an revert the optimistic update
			return apiPromise.then( () => {
				expect( dispatchSpy ).to.be.calledWith( {
					type: COMMENTS_LIKE_UPDATE,
					siteId: 1,
					postId: 1,
					commentId: 1,
					iLike: true,
					likeCount: 123
				} );
			} );
		} );
	} ); // likeComment

	describe( '#unlikeComment()', () => {
		it( 'should dispatch correct actions when request fails', () => {
			const unlikeThunk = unlikeComment( 1, 1, 1 );
			const dispatchSpy = sinon.spy();

			const apiPromise = unlikeThunk( dispatchSpy );

			expect( dispatchSpy ).to.be.calledWith( {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 1
			} );

			// since we didn't mock the request and we have disabled requests
			// we expect this to fail an revert the optimistic update
			return apiPromise.then( () => {
				expect( dispatchSpy ).to.be.calledWith( {
					type: COMMENTS_LIKE,
					siteId: 1,
					postId: 1,
					commentId: 1
				} );
			} );
		} );

		it( 'should dispatch correct action when request succeed', () => {
			const dispatchSpy = sinon.spy();

			nock( API_DOMAIN )
				.post( '/rest/v1.1/sites/1/comments/1/likes/mine/delete' )
				.query( { source: 'reader' } )
				.reply( 200, {
					success: true,
					i_like: false,
					like_count: 122
				} );

			const unlikeThunk = unlikeComment( 1, 1, 1 );
			const apiPromise = unlikeThunk( dispatchSpy );

			expect( dispatchSpy ).to.be.calledWith( {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 1
			} );

			// since we didn't mock the request and we have disabled requests
			// we expect this to fail an revert the optimistic update
			return apiPromise.then( () => {
				expect( dispatchSpy ).to.be.calledWith( {
					type: COMMENTS_LIKE_UPDATE,
					siteId: 1,
					postId: 1,
					commentId: 1,
					iLike: false,
					likeCount: 122
				} );
			} );
		} );
	} ); // unlikeComment
} );
