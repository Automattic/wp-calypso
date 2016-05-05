// External Dependencies
var expect = require( 'chai' ).expect,
	Dispatcher = require( 'dispatcher' );

// Internal Dependencies
var CommentLikeStore = require( '../comment-like-store' );

// Non-existent site ID
const siteId = 91234567890;

describe( 'comment-like-store', function() {
	beforeEach( function() {
		CommentLikeStore._reset();
	} );

	it( 'should have a dispatch token', function() {
		expect( CommentLikeStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should add a new like for the current user', function() {
		Dispatcher.handleViewAction( {
			type: 'LIKE_COMMENT',
			siteId: siteId,
			commentId: 123
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.true;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_LIKE_RESPONSE',
			siteId: siteId,
			commentId: 123,
			data: {
				success: true,
				i_like: true,
				like_count: 1
			},
			error: null
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.true;
	} );

	it( 'should add a new unlike for the current user', function() {
		Dispatcher.handleViewAction( {
			type: 'UNLIKE_COMMENT',
			siteId: siteId,
			commentId: 123
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.false;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_UNLIKE_RESPONSE',
			siteId: siteId,
			commentId: 123,
			data: {
				success: true,
				i_like: false,
				like_count: 0
			},
			error: null
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.false;
	} );

	it( 'should reverse a new like if there is an error', function() {
		Dispatcher.handleViewAction( {
			type: 'LIKE_COMMENT',
			siteId: siteId,
			commentId: 123
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.true;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_LIKE_RESPONSE',
			siteId: siteId,
			commentId: 123,
			data: {
				success: true,
				i_like: false,
				like_count: 0
			},
			error: new Error()
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.false;
	} );

	it( 'should reverse a new like if there if the success flag is false', function() {
		Dispatcher.handleViewAction( {
			type: 'LIKE_COMMENT',
			siteId: siteId,
			commentId: 123
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.true;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_LIKE_RESPONSE',
			siteId: siteId,
			commentId: 123,
			data: {
				success: false,
				i_like: false,
				like_count: 0
			},
			error: null
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.false;
	} );

	it( 'should reverse a new unlike if there is an error', function() {
		Dispatcher.handleViewAction( {
			type: 'UNLIKE_COMMENT',
			siteId: siteId,
			commentId: 123
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.false;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_UNLIKE_RESPONSE',
			siteId: siteId,
			commentId: 123,
			data: {
				success: true,
				i_like: false,
				like_count: 0
			},
			error: new Error()
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.true;
	} );

	it( 'should reverse a new unlike if there if the success flag is false', function() {
		Dispatcher.handleViewAction( {
			type: 'UNLIKE_COMMENT',
			siteId: siteId,
			commentId: 123
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.false;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_COMMENT_UNLIKE_RESPONSE',
			siteId: siteId,
			commentId: 123,
			data: {
				success: false,
				i_like: false,
				like_count: 0
			},
			error: null
		} );

		expect( CommentLikeStore.isCommentLikedByCurrentUser( siteId, 123 ) ).to.be.true;
	} );
} );
