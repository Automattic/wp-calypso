/**
 * External dependencies
 */
import { expect } from 'chai';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	items,
	requests,
	totalCommentsCount,
	default as comments
} from '../reducer';
import {
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE,
	COMMENTS_ERROR,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_RECEIVE,
	COMMENTS_REMOVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from '../../action-types';
import {
	createRequestId
} from '../utils';
import {
	PLACEHOLDER_STATE
} from '../constants';
import {
	getPostCommentItems,
	getPostCommentRequests,
	getPostTotalCommentsCount
} from '../selectors';

const commentsNestedTree = [
	{ ID: 11, parent: { ID: 9 }, text: 'eleven', date: '2016-01-31T10:07:18-08:00' },
	{ ID: 10, parent: { ID: 9 }, text: 'ten', date: '2016-01-29T10:07:18-08:00' },
	{ ID: 9, parent: { ID: 6 }, text: 'nine', date: '2016-01-28T11:07:18-08:00' },
	{ ID: 8, parent: false, text: 'eight', date: '2016-01-28T10:17:18-08:00' },
	{ ID: 7, parent: false, text: 'seven', date: '2016-01-28T10:08:18-08:00' },
	{ ID: 6, parent: false, text: 'six', date: '2016-01-28T10:07:18-08:00' }
];

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should build an ordered by date list', () => {
			const res = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ ...commentsNestedTree ].sort( () => Math.random() * 2 % 2 ? -1 : 1 )
			} );

			const specificRes = getPostCommentItems( { comments: { items: res } }, 1, 1 );

			expect( specificRes.size ).to.equal( commentsNestedTree.length );

			[ ...commentsNestedTree ].sort( ( a, b ) => new Date( b.date ) - new Date( a.date ) )
							.forEach( ( comment, idx ) => expect( comment.ID ).to.equal( specificRes.getIn( [ idx, 'ID' ] ) ) );
		} );

		it( 'should build correct items list on consecutive calls', () => {
			const res = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree.slice( 0, 2 )
			} );

			const res2 = items( res, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree.slice( 1, commentsNestedTree.length )
			} );

			const specificCommentItemList = getPostCommentItems( { comments: { items: res2 } }, 1, 1 );

			expect( specificCommentItemList.size ).to.equal( commentsNestedTree.length );
			commentsNestedTree.forEach( ( comment, idx ) =>
				expect( specificCommentItemList.getIn( [ idx, 'ID' ] ) ).to.equal( comment.ID )
			);
		} );

		it( 'should remove a comment by id', () => {
			const removedCommentId = 9;

			const state = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree
			} );

			const testedState = items( state, {
				type: COMMENTS_REMOVE,
				siteId: 1,
				postId: 1,
				commentId: removedCommentId
			} );

			const specificRes = getPostCommentItems( { comments: { items: testedState } }, 1, 1 );

			expect( specificRes.size ).to.equal( commentsNestedTree.length - 1 );
			specificRes.forEach( c => expect( c.get( 'ID' ) ).not.to.equal( removedCommentId ) );
		} );

		it( 'should increase like counts and set i_like', () => {
			const state = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ {
					ID: 123,
					like_count: 100,
					i_like: false
				} ]
			} );

			const newState = items( state, {
				type: COMMENTS_LIKE,
				siteId: 1,
				postId: 1,
				commentId: 123
			} );

			const specificRes = getPostCommentItems( { comments: { items: newState } }, 1, 1 );

			expect( specificRes.find( c => c.get( 'ID' ) === 123 ).get( 'like_count' ) ).to.equal( 101 );
			expect( specificRes.find( c => c.get( 'ID' ) === 123 ).get( 'i_like' ) ).to.equal( true );
		} );

		it( 'should decrease like counts and unset i_like', () => {
			const state = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ {
					ID: 123,
					like_count: 100,
					i_like: true
				} ]
			} );

			const newState = items( state, {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 123
			} );

			const specificRes = getPostCommentItems( { comments: { items: newState } }, 1, 1 );

			expect( specificRes.find( c => c.get( 'ID' ) === 123 ).get( 'like_count' ) ).to.equal( 99 );
			expect( specificRes.find( c => c.get( 'ID' ) === 123 ).get( 'i_like' ) ).to.equal( false );
		} );

		it( 'should update like for a comment', () => {
			const state = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ {
					ID: 123,
					like_count: 100,
					i_like: true
				} ]
			} );

			const newState = items( state, {
				type: COMMENTS_LIKE_UPDATE,
				siteId: 1,
				postId: 1,
				commentId: 123,
				iLike: false,
				likeCount: 80
			} );

			const specificRes = getPostCommentItems( { comments: { items: newState } }, 1, 1 );

			expect( specificRes.find( c => c.get( 'ID' ) === 123 ).get( 'like_count' ) ).to.equal( 80 );
			expect( specificRes.find( c => c.get( 'ID' ) === 123 ).get( 'i_like' ) ).to.equal( false );
		} );

		it( 'should set error state on a placeholder', () => {
			const state = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ {
					ID: 'placeholder-123',
					placeholderState: PLACEHOLDER_STATE.PENDING,
					isPlaceholder: true
				} ]
			} );

			const newState = items( state, {
				type: COMMENTS_ERROR,
				siteId: 1,
				postId: 1,
				commentId: 'placeholder-123'
			} );

			const specificRes = getPostCommentItems( { comments: { items: newState } }, 1, 1 );

			expect( specificRes.find( c => c.get( 'ID' ) === 'placeholder-123' ).get( 'placeholderState' ) ).to.equal( PLACEHOLDER_STATE.ERROR );
		} );
	} ); // end of items

	describe( '#requests', () => {
		it( 'should set state of query according to the action', () => {
			const postId = 1;
			const siteId = 1;
			const requestId = createRequestId( siteId, postId, { after: new Date(), order: 'DESC', number: 10 } );

			let action = {
				type: COMMENTS_REQUEST,
				siteId,
				postId,
				requestId: requestId
			};

			let res = requests( undefined, action );
			let specificRes = getPostCommentRequests( { comments: { requests: res } }, siteId, postId );

			expect( specificRes.get( requestId ) ).to.be.eql( COMMENTS_REQUEST );

			action.type = COMMENTS_REQUEST_FAILURE;
			res = requests( res, action );

			specificRes = getPostCommentRequests( { comments: { requests: res } }, siteId, postId );

			expect( specificRes.get( requestId ) ).to.be.eql( COMMENTS_REQUEST_FAILURE );
		} );
	} ); // end of requests

	describe( '#totalCommentsCount()', () => {
		it( 'should update post comments count', () => {
			const newState = totalCommentsCount( undefined, {
				type: COMMENTS_COUNT_RECEIVE,
				totalCommentsCount: 123,
				siteId: 1,
				postId: 1
			} );

			const specificRes = getPostTotalCommentsCount( { comments: { totalCommentsCount: newState } }, 1, 1 );

			expect( specificRes ).to.eql( 123 );
		} );
	} ); // end of totalCommentsCount

	describe( '#comments()', () => {
		it( 'should not serialize/deserialize', () => {
			const state = comments( undefined, {
				type: COMMENTS_RECEIVE,
				comments: commentsNestedTree.slice( 0, 2 ),
				siteId: 1,
				postId: 1
			} );

			const serialized = comments( state, { type: SERIALIZE } );

			expect( Object.getOwnPropertyNames( serialized.items ).length ).to.equal( 0 );
			expect( Object.getOwnPropertyNames( serialized.requests ).length ).to.equal( 0 );
			expect( Object.getOwnPropertyNames( serialized.totalCommentsCount ).length ).to.equal( 0 );

			const deserialized = comments( serialized, { type: DESERIALIZE } );

			expect( Immutable.Map.isMap( deserialized.items ) ).to.equal( true );
			expect( deserialized.items.size ).to.equal( 0 );
			expect( Immutable.Map.isMap( deserialized.requests ) ).to.equal( true );
			expect( deserialized.requests.size ).to.equal( 0 );
			expect( Immutable.Map.isMap( deserialized.totalCommentsCount ) ).to.equal( true );
			expect( deserialized.totalCommentsCount.size ).to.equal( 0 );
		} );
	} ); // end of comments
} );
