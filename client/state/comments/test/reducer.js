/**
 * External dependencies
 */
import { expect } from 'chai';
import { map, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	items,
	requests,
	totalCommentsCount,
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
	COMMENTS_REQUEST_FAILURE
} from '../../action-types';
import {
	createRequestId
} from '../utils';
import {
	PLACEHOLDER_STATE
} from '../constants';

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
			const response = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ ...commentsNestedTree ].sort( () => Math.random() * 2 % 2 ? -1 : 1 )
			} );
			const ids = map( response[ '1-1' ], 'ID' );

			expect( response[ '1-1' ] ).to.have.lengthOf( 6 );
			expect( ids ).to.eql( [ 6, 7, 8, 9, 10, 11 ] );
		} );

		it( 'should build correct items list on consecutive calls', () => {
			const state = {
				'1-1': commentsNestedTree.slice( 0, 2 )
			};

			const response = items( state, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree.slice( 1, commentsNestedTree.length )
			} );

			expect( response[ '1-1' ] ).to.have.lengthOf( 6 );
		} );

		it( 'should remove a comment by id', () => {
			const removedCommentId = 9;
			const state = { '1-1': commentsNestedTree };
			const result = items( state, {
				type: COMMENTS_REMOVE,
				siteId: 1,
				postId: 1,
				commentId: removedCommentId
			} );

			expect( result[ '1-1' ] ).to.have.lengthOf( commentsNestedTree.length - 1 );
			forEach( result, c => expect( c.ID ).not.to.equal( removedCommentId ) );
		} );

		it( 'should increase like counts and set i_like', () => {
			const state = { '1-1': [
				{ ID: 123, like_count: 100, i_like: false }
			] };

			const result = items( state, {
				type: COMMENTS_LIKE,
				siteId: 1,
				postId: 1,
				commentId: 123
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).to.equal( 101 );
			expect( result[ '1-1' ][ 0 ].i_like ).to.equal( true );
		} );

		it( 'should decrease like counts and unset i_like', () => {
			const state = { '1-1': [
				{ ID: 123, like_count: 100, i_like: true }
			] };

			const result = items( state, {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 123
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).to.equal( 99 );
			expect( result[ '1-1' ][ 0 ].i_like ).to.equal( false );
		} );

		it( 'should update like for a comment', () => {
			const state = { '1-1': [
				{ ID: 123, like_count: 100, i_like: true }
			] };

			const result = items( state, {
				type: COMMENTS_LIKE_UPDATE,
				siteId: 1,
				postId: 1,
				commentId: 123,
				iLike: false,
				likeCount: 80
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).to.equal( 80 );
			expect( result[ '1-1' ][ 0 ].i_like ).to.equal( false );
		} );

		it( 'should set error state on a placeholder', () => {
			const state = { '1-1': [
				{
					ID: 'placeholder-123',
					placeholderState: PLACEHOLDER_STATE.PENDING,
					isPlaceholder: true
				}
			] };

			const result = items( state, {
				type: COMMENTS_ERROR,
				siteId: 1,
				postId: 1,
				commentId: 'placeholder-123',
				error: 'error_message'
			} );

			expect( result[ '1-1' ][ 0 ].placeholderState ).to.equal( PLACEHOLDER_STATE.ERROR );
			expect( result[ '1-1' ][ 0 ].placeholderError ).to.equal( 'error_message' );
		} );
	} ); // end of items

	describe( '#requests', () => {
		it( 'should set state of query according to the action', () => {
			const postId = 1;
			const siteId = 1;
			const requestId = createRequestId( siteId, postId, { after: new Date(), order: 'DESC', number: 10 } );

			const action = {
				type: COMMENTS_REQUEST,
				siteId,
				postId,
				requestId: requestId
			};

			const response = requests( undefined, action );
			expect( response[ '1-1' ][ requestId ] ).to.be.eql( COMMENTS_REQUEST );

			action.type = COMMENTS_REQUEST_FAILURE;
			const failureResponse = requests( response, action );

			expect( failureResponse[ '1-1' ][ requestId ] ).to.be.eql( COMMENTS_REQUEST_FAILURE );
		} );
	} ); // end of requests

	describe( '#totalCommentsCount()', () => {
		it( 'should update post comments count', () => {
			const response = totalCommentsCount( undefined, {
				type: COMMENTS_COUNT_RECEIVE,
				totalCommentsCount: 123,
				siteId: 1,
				postId: 1
			} );

			expect( response[ '1-1' ] ).to.eql( 123 );
		} );
	} ); // end of totalCommentsCount
} );
