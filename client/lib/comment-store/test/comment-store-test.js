var debug = require( 'debug' )( 'calypso:comment-store:test' ); //eslint-disable-line no-unused-vars

/**
 * External Dependencies
 */
var expect = require( 'chai' ).expect,
	Dispatcher = require( 'dispatcher' );

var CommentStore = require( '../comment-store' ),
	FeedPostStoreActionTypes = require( 'lib/feed-post-store/constants' ).action,
	CommentStates = require( 'lib/comment-store/constants' ).state;

// Non-existent site ID
const siteId = 91234567890;

describe( 'comment-store', function() {
	beforeEach( function() {
		CommentStore._reset();
	} );

	it( 'should have a dispatch token', function() {
		expect( CommentStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should return the list of comments for a post', function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_COMMENTS',
			siteId: siteId,
			postId: 123,
			data: {
				found: 1,
				site_ID: siteId,
				comments: [ { ID: 1, content: 'What a marvellous post' } ]
			},
			error: null
		} );

		// getCommentsForPost( site_ID, post_ID )
		const comments = CommentStore.getCommentsForPost( siteId, 123 );
		expect( comments ).to.be.ok;
		expect( comments[ 0 ][ 0 ].content ).to.eq( 'What a marvellous post' );
		expect( comments[ 0 ] ).to.have.lengthOf( 1 );
	} );

	it( 'should ignore a response without a post ID', function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_COMMENTS',
			data: {
				post_ID: null,
				site_ID: siteId,
				comments: [ { ID: 555 } ]
			},
			error: null
		} );

		expect( CommentStore._all() ).to.be.empty;
	} );

	it( 'should ignore a response with an error', function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_COMMENTS',
			data: {
				post_ID: 1,
				site_ID: siteId,
				comments: [ { ID: 123, login: 'bluefuton' } ]
			},
			error: new Error()
		} );

		expect( CommentStore._all() ).to.be.empty;
	} );

	it( 'should pick up feed posts', function() {
		Dispatcher.handleServerAction( {
			type: FeedPostStoreActionTypes.RECEIVE_FEED_POST,
			id: '1234',
			error: null,
			data: {
				discussion: {
					comments_open: true,
					comment_count: 100
				},
				is_external: false,
				site_ID: siteId,
				ID: 1
			}
		} );

		expect( CommentStore.getCommentCountForPost( siteId, 1 ) ).to.eq( 100 );
		expect( CommentStore.getCommentsForPost( siteId, 1 ) ).to.be.null;
	} );

	it( 'should return child comments', function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_COMMENTS',
			siteId: siteId,
			postId: 123,
			data: {
				found: 2,
				site_ID: siteId,
				comments: [
					{
						ID: 1,
						content: 'What a marvellous post'
					},
					{
						ID: 2,
						content: '+1. I agree!',
						parent: { ID: 1 }
					},
				]
			},
			error: null
		} );

		// getCommentsForPost( site_ID, post_ID )
		const comments = CommentStore.getCommentsForPost( siteId, 123, 1 );
		expect( comments ).to.be.ok;
		expect( comments[ 1 ][ 0 ].content ).to.eq( '+1. I agree!' );
		expect( comments[ 1 ] ).to.have.lengthOf( 1 );
	} );

	it( 'should add a pending comment', function() {
		Dispatcher.handleServerAction( {
			type: 'ADD_COMMENT',
			args: {
				siteId: siteId,
				postId: 124,
				commentText: 'First!',
				parentCommentId: 0,
				commentPlaceholderId: 0
			}
		} );

		const comments = CommentStore.getCommentsForPost( siteId, 124 );
		expect( comments ).to.be.ok;
		expect( comments[ 0 ][ 0 ].content ).to.eq( 'First!' );
		expect( comments[ 0 ][ 0 ].state ).to.eq( CommentStates.PENDING );
	} );

	it( 'should confirm a pending comment', function() {
		Dispatcher.handleServerAction( {
			type: 'ADD_COMMENT',
			args: {
				siteId: siteId,
				postId: 124,
				commentText: 'First!',
				parentCommentId: 0,
				commentPlaceholderId: 0
			}
		} );

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ADD_COMMENT',
			args: {
				siteId: siteId,
				postId: 124,
				commentPlaceholderId: 0
			},
			data: {
				content: 'First!',
				parent: {
					ID: 0
				}
			}
		} );

		const comments = CommentStore.getCommentsForPost( siteId, 124 );
		expect( comments ).to.be.ok;
		expect( comments[ 0 ][ 0 ].content ).to.eq( 'First!' );
		expect( comments[ 0 ][ 0 ].state ).to.eq( CommentStates.COMPLETE );
	} );
} );
