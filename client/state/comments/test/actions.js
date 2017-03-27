/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	COMMENTS_RECEIVE,
	COMMENTS_REMOVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
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
	getCommentParentKey,
	createRequestId
} from '../utils';
import {
	NUMBER_OF_COMMENTS_PER_FETCH
} from '../constants'

const MANY_COMMENTS_POST = {
	siteId: 91750058,
	postId: 287
};

const API_DOMAIN = 'https://public-api.wordpress.com:443';

describe( 'actions', () => {
	after( () => {
		nock.cleanAll();
	} );

	describe( '#receivePost()', () => {
		it( 'should return a thunk', () => {
			const res = requestPostComments( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId );

			expect( res ).to.be.a.function;
		} );

		it( 'should not dispatch a thing if the request is already in flight', () => {
			const requestId = createRequestId( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId, { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, status: 'approved' } );

			const dispatchSpy = sinon.spy();
			const getStateStub = sinon.stub().returns( {
				comments: {
					items: Immutable.Map(),
					requests: Immutable.fromJS( {
						[ getCommentParentKey( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId ) ]: {
							[ requestId ]: COMMENTS_REQUEST
						}
					} )
				}
			} );

			requestPostComments( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId )( dispatchSpy, getStateStub );

			expect( dispatchSpy ).to.not.have.been.called;
		} );

		it( 'should dispatch correct first request actions', function() {
			const dispatchSpy = sinon.spy();
			const getStateStub = sinon.stub().returns( {
				comments: {
					items: Immutable.Map(),
					requests: Immutable.Map()
				}
			} );

			nock( API_DOMAIN )
				.get( `/rest/v1.1/sites/${ MANY_COMMENTS_POST.siteId }/posts/${ MANY_COMMENTS_POST.postId }/replies/` )
				.query( { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, status: 'approved' } )
				.reply( 200, { found: 123, comments: [] } );

			const reqPromise = requestPostComments( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId )( dispatchSpy, getStateStub );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: COMMENTS_REQUEST,
				requestId: createRequestId( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId, { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, status: 'approved' } )
			} );

			return reqPromise.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: COMMENTS_REQUEST_SUCCESS,
					requestId: createRequestId( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId, { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, status: 'approved' } )
				} );
			} );
		} );

		it( 'should dispatch correct consecutive request actions', function() {
			const beforeDateString = '2016-02-03T04:19:26.352Z';
			const dispatchSpy = sinon.spy();
			const getStateSpy = sinon.stub().returns( {
				comments: {
					items: Immutable.fromJS( {
						[ getCommentParentKey( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId ) ]: [
							{ ID: 123, date: beforeDateString }
						]
					} ),
					requests: Immutable.fromJS( {
						[ getCommentParentKey( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId ) ]: { }
					} )
				}
			} );

			nock( API_DOMAIN )
				.get( `/rest/v1.1/sites/${ MANY_COMMENTS_POST.siteId }/posts/${ MANY_COMMENTS_POST.postId }/replies/` )
				.query( { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH } )
				.reply( 200, { found: 123, comments: [] } )
				.get( `/rest/v1.1/sites/${ MANY_COMMENTS_POST.siteId }/posts/${ MANY_COMMENTS_POST.postId }/replies/` )
				.query( { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, before: beforeDateString, status: 'approved' } )
				.reply( 200, { found: 123, comments: [] } );

			const reqPromise = requestPostComments( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId )( dispatchSpy, getStateSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: COMMENTS_REQUEST,
				requestId: createRequestId( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId, { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, before: new Date( beforeDateString ).toISOString(), status: 'approved' } )
			} );

			return reqPromise.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: COMMENTS_REQUEST_SUCCESS,
					requestId: createRequestId( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId, { order: 'DESC', number: NUMBER_OF_COMMENTS_PER_FETCH, before: new Date( beforeDateString ).toISOString(), status: 'approved' } )
				} );
			} );
		} );
	} ); // requestPostComments

	describe( '#writeComment()', () => {
		before( () => {
			nock( API_DOMAIN )
				.post( '/rest/v1.1/sites/' + MANY_COMMENTS_POST.siteId + '/posts/' + MANY_COMMENTS_POST.postId + '/replies/new', { content: 'Hello, yes, this is dog' } )
				.reply( 200,
				{
					ID: 13,
					post: {
						ID: MANY_COMMENTS_POST.postId,
						title: 'My awesome post!',
						type: 'post',
						link: 'https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/' + MANY_COMMENTS_POST.siteId + '\/posts\/' + MANY_COMMENTS_POST.postId
					},
					author: { ID: 1234, login: 'tester', email: false, name: 'Testie Test', first_name: 'Testie', last_name: 'Test', nice_name: 'test', site_ID: 1234 },
					date: '2016-02-05T11:17:03+00:00',
					content: '<p>Hello, yes, this is dog<\/p>\n',
					status: 'approved',
					parent: false,
					type: 'comment'
				} );
		} );

		it( 'should dispatch correct actions', function() {
			const dispatchSpy = sinon.spy();
			const writeCommentThunk = writeComment( 'Hello, yes, this is dog', MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId );

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
			const removeCommentAction = removeComment( MANY_COMMENTS_POST.siteId, MANY_COMMENTS_POST.postId, 'placeholder-123' );

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
			} )
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
			} )
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
			} )
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
			} )
		} );
	} ); // unlikeComment
} );
