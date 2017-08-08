/**
 * External dependencies
 */
import { expect } from 'chai';
import { map, forEach } from 'lodash';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	items,
	totalCommentsCount,
	fetchStatus,
	fetchStatusInitialState,
	treesInitialized,
} from '../reducer';
import {
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_ERROR,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_RECEIVE,
	COMMENTS_DELETE,
	COMMENTS_TREE_SITE_ADD,
} from '../../action-types';
import { PLACEHOLDER_STATE } from '../constants';

const commentsNestedTree = [
	{ ID: 11, parent: { ID: 9 }, text: 'eleven', date: '2016-01-31T10:07:18-08:00' },
	{ ID: 10, parent: { ID: 9 }, text: 'ten', date: '2016-01-29T10:07:18-08:00' },
	{ ID: 9, parent: { ID: 6 }, text: 'nine', date: '2016-01-28T11:07:18-08:00' },
	{ ID: 8, parent: false, text: 'eight', date: '2016-01-28T10:17:18-08:00' },
	{ ID: 7, parent: false, text: 'seven', date: '2016-01-28T10:08:18-08:00' },
	{ ID: 6, parent: false, text: 'six', date: '2016-01-28T10:07:18-08:00' },
];

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should build an ordered by date list', () => {
			const response = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ ...commentsNestedTree ].sort( () => ( Math.random() * 2 % 2 ? -1 : 1 ) ),
			} );
			const ids = map( response[ '1-1' ], 'ID' );

			expect( response[ '1-1' ] ).to.have.lengthOf( 6 );
			expect( ids ).to.eql( [ 11, 10, 9, 8, 7, 6 ] );
		} );

		it( 'should build correct items list on consecutive calls', () => {
			const state = deepFreeze( {
				'1-1': commentsNestedTree.slice( 0, 2 ),
			} );

			const response = items( state, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree.slice( 1, commentsNestedTree.length ),
			} );

			expect( response[ '1-1' ] ).to.have.lengthOf( 6 );
		} );

		it( 'should remove a comment by id', () => {
			const removedCommentId = 9;
			const state = deepFreeze( { '1-1': commentsNestedTree } );
			const result = items( state, {
				type: COMMENTS_DELETE,
				siteId: 1,
				postId: 1,
				commentId: removedCommentId,
			} );

			expect( result[ '1-1' ] ).to.have.lengthOf( commentsNestedTree.length - 1 );
			forEach( result, c => expect( c.ID ).not.to.equal( removedCommentId ) );
		} );

		it( 'should increase like counts and set i_like', () => {
			const state = deepFreeze( {
				'1-1': [ { ID: 123, like_count: 100, i_like: false } ],
			} );

			const result = items( state, {
				type: COMMENTS_LIKE,
				siteId: 1,
				postId: 1,
				commentId: 123,
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).to.equal( 101 );
			expect( result[ '1-1' ][ 0 ].i_like ).to.equal( true );
		} );

		it( 'should decrease like counts and unset i_like', () => {
			const state = deepFreeze( {
				'1-1': [ { ID: 123, like_count: 100, i_like: true } ],
			} );

			const result = items( state, {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 123,
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).to.equal( 99 );
			expect( result[ '1-1' ][ 0 ].i_like ).to.equal( false );
		} );

		it( 'should set error state on a placeholder', () => {
			const state = deepFreeze( {
				'1-1': [
					{
						ID: 'placeholder-123',
						placeholderState: PLACEHOLDER_STATE.PENDING,
						isPlaceholder: true,
					},
				],
			} );

			const result = items( state, {
				type: COMMENTS_ERROR,
				siteId: 1,
				postId: 1,
				commentId: 'placeholder-123',
				error: 'error_message',
			} );

			expect( result[ '1-1' ][ 0 ].placeholderState ).to.equal( PLACEHOLDER_STATE.ERROR );
			expect( result[ '1-1' ][ 0 ].placeholderError ).to.equal( 'error_message' );
		} );
	} );

	describe( '#fetchStatus', () => {
		const actionWithComments = {
			type: COMMENTS_RECEIVE,
			siteId: '123',
			postId: '456',
			direction: 'before',
			comments: [ {}, {} ],
		};
		const actionWithCommentId = {
			type: COMMENTS_RECEIVE,
			siteId: '123',
			commentById: true,
			comments: [ {} ],
			direction: 'after',
		};

		it( 'should default to an empty object', () => {
			expect( fetchStatus( undefined, { type: 'okapi' } ) ).eql( {} );
		} );

		it( 'should set hasReceived and before/after when receiving commments', () => {
			const prevState = {};
			const nextState = fetchStatus( prevState, actionWithComments );
			expect( nextState ).eql( {
				[ `${ actionWithComments.siteId }-${ actionWithComments.postId }` ]: {
					before: false,
					after: true,
					hasReceivedBefore: true,
					hasReceivedAfter: false,
				},
			} );
		} );

		it( 'fetches by id should not modify the state', () => {
			const prevState = { [ actionWithCommentId.siteId ]: fetchStatusInitialState };
			const nextState = fetchStatus( prevState, actionWithCommentId );

			expect( nextState ).equal( prevState );
		} );
	} );

	describe( '#totalCommentsCount()', () => {
		it( 'should update post comments count', () => {
			const response = totalCommentsCount( undefined, {
				type: COMMENTS_COUNT_RECEIVE,
				totalCommentsCount: 123,
				siteId: 1,
				postId: 1,
			} );

			expect( response[ '1-1' ] ).to.eql( 123 );
		} );

		it( 'should increment post comment count', () => {
			const response = totalCommentsCount(
				{
					'1-1': 1,
				},
				{
					type: COMMENTS_COUNT_INCREMENT,
					siteId: 1,
					postId: 1,
				},
			);

			expect( response[ '1-1' ] ).to.eql( 2 );
		} );
	} );
	describe( '#treesInitialized()', () => {
		it( 'should track when a tree is initialized for a given query', () => {
			const state = treesInitialized(
				undefined,
				{
					type: COMMENTS_TREE_SITE_ADD,
					siteId: 77203074,
					status: 'unapproved',
				} );
			expect( state ).to.eql( {
				77203074: { unapproved: true }
			} );
		} );
		it( 'can track init status of many states', () => {
			const initState = deepFreeze( { 77203074: { unapproved: true } } );
			const state = treesInitialized(
				initState,
				{
					type: COMMENTS_TREE_SITE_ADD,
					siteId: 77203074,
					status: 'spam',
				} );
			expect( state ).to.eql( {
				77203074: { unapproved: true, spam: true }
			} );
		} );
		it( 'can track init status of many sites', () => {
			const initState = deepFreeze( { 77203074: { unapproved: true } } );
			const state = treesInitialized(
				initState,
				{
					type: COMMENTS_TREE_SITE_ADD,
					siteId: 2916284,
					status: 'unapproved',
				} );
			expect( state ).to.eql( {
				77203074: { unapproved: true },
				2916284: { unapproved: true }
			} );
		} );
	} );
} );
