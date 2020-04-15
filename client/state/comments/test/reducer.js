/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { map, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENT_COUNTS_UPDATE,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_RECEIVE_ERROR,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_RECEIVE,
	COMMENTS_UPDATES_RECEIVE,
	COMMENTS_DELETE,
	COMMENTS_TREE_SITE_ADD,
	COMMENTS_EDIT,
	COMMENTS_CHANGE_STATUS,
} from '../../action-types';
import { expandComments, setActiveReply } from '../actions';
import { PLACEHOLDER_STATE } from '../constants';
import {
	counts,
	items,
	pendingItems,
	expansions,
	totalCommentsCount,
	fetchStatus,
	fetchStatusInitialState,
	treesInitialized,
	activeReplies,
} from '../reducer';

const commentsNestedTree = [
	{ ID: 11, parent: { ID: 9 }, content: 'eleven', date: '2016-01-31T10:07:18-08:00' },
	{ ID: 10, parent: { ID: 9 }, content: 'ten', date: '2016-01-29T10:07:18-08:00' },
	{ ID: 9, parent: { ID: 6 }, content: 'nine', date: '2016-01-28T11:07:18-08:00' },
	{ ID: 8, parent: false, content: 'eight', date: '2016-01-28T10:17:18-08:00' },
	{ ID: 7, parent: false, content: 'seven', date: '2016-01-28T10:08:18-08:00' },
	{ ID: 6, parent: false, content: 'six', date: '2016-01-28T10:07:18-08:00' },
];

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should build an ordered by date list', () => {
			const response = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ ...commentsNestedTree ].sort( () => ( ( Math.random() * 2 ) % 2 ? -1 : 1)  ),
			} );
			const ids = map( response[ '1-1' ], 'ID' );

			expect( response[ '1-1' ] ).toHaveLength( 6 );
			expect( ids ).toEqual( [ 11, 10, 9, 8, 7, 6 ] );
		} );

		test( 'should build correct items list on consecutive calls', () => {
			const state = deepFreeze( {
				'1-1': commentsNestedTree.slice( 0, 2 ),
			} );

			const response = items( state, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree.slice( 1, commentsNestedTree.length ),
			} );

			expect( response[ '1-1' ] ).toHaveLength( 6 );
		} );

		test( 'should remove a comment by id', () => {
			const removedCommentId = 9;
			const state = deepFreeze( { '1-1': commentsNestedTree } );
			const result = items( state, {
				type: COMMENTS_DELETE,
				siteId: 1,
				postId: 1,
				commentId: removedCommentId,
			} );

			expect( result[ '1-1' ] ).toHaveLength( commentsNestedTree.length - 1 );
			forEach( result, ( c ) => expect( c.ID ).not.toEqual( removedCommentId ) );
		} );

		test( 'should increase like counts and set i_like', () => {
			const state = deepFreeze( {
				'1-1': [ { ID: 123, like_count: 100, i_like: false } ],
			} );

			const result = items( state, {
				type: COMMENTS_LIKE,
				siteId: 1,
				postId: 1,
				commentId: 123,
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).toEqual( 101 );
			expect( result[ '1-1' ][ 0 ].i_like ).toEqual( true );
		} );

		test( 'should decrease like counts and unset i_like', () => {
			const state = deepFreeze( {
				'1-1': [ { ID: 123, like_count: 100, i_like: true } ],
			} );

			const result = items( state, {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 123,
			} );

			expect( result[ '1-1' ][ 0 ].like_count ).toEqual( 99 );
			expect( result[ '1-1' ][ 0 ].i_like ).toEqual( false );
		} );

		test( 'should set error state on a placeholder', () => {
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
				type: COMMENTS_RECEIVE_ERROR,
				siteId: 1,
				postId: 1,
				commentId: 'placeholder-123',
				error: 'error_message',
			} );

			expect( result[ '1-1' ][ 0 ].placeholderState ).toEqual( PLACEHOLDER_STATE.ERROR );
			expect( result[ '1-1' ][ 0 ].placeholderError ).toEqual( 'error_message' );
		} );

		test( 'should edit a comment by id', () => {
			const state = deepFreeze( {
				'1-1': [ { ID: 123, content: 'lorem ipsum' } ],
			} );

			const result = items( state, {
				type: COMMENTS_EDIT,
				siteId: 1,
				postId: 1,
				commentId: 123,
				comment: { content: 'lorem ipsum dolor' },
			} );

			expect( result ).toEqual( { '1-1': [ { ID: 123, content: 'lorem ipsum dolor' } ] } );
			expect( result[ '1-1' ] ).toHaveLength( 1 );
		} );

		test( 'should allow Comment Management to edit content and author details', () => {
			const state = deepFreeze( {
				'1-1': [
					{
						ID: 123,
						author: {
							name: 'Foo',
							url: 'https://example.com/',
						},
						content: 'Lorem ipsum',
					},
				],
			} );

			const result = items( state, {
				type: COMMENTS_EDIT,
				siteId: 1,
				postId: 1,
				commentId: 123,
				comment: {
					authorDisplayName: 'Bar',
					authorUrl: 'https://wordpress.com/',
					commentContent: 'Lorem ipsum dolor sit amet',
				},
			} );

			expect( result ).toEqual( {
				'1-1': [
					{
						ID: 123,
						author: {
							name: 'Bar',
							url: 'https://wordpress.com/',
						},
						content: 'Lorem ipsum dolor sit amet',
					},
				],
			} );
			expect( result[ '1-1' ] ).toHaveLength( 1 );
		} );
	} );

	describe( '#pendingItems', () => {
		test( 'should build an ordered by date list', () => {
			const response = pendingItems( undefined, {
				type: COMMENTS_UPDATES_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ ...commentsNestedTree ].sort( () => ( ( Math.random() * 2 ) % 2 ? -1 : 1)  ),
			} );
			const ids = map( response[ '1-1' ], 'ID' );

			expect( response[ '1-1' ] ).toHaveLength( 6 );
			expect( ids ).toEqual( [ 11, 10, 9, 8, 7, 6 ] );
		} );

		test( 'should build correct items list on consecutive calls', () => {
			const state = deepFreeze( {
				'1-1': commentsNestedTree.slice( 0, 2 ),
			} );

			const response = pendingItems( state, {
				type: COMMENTS_UPDATES_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: commentsNestedTree.slice( 1, commentsNestedTree.length ),
			} );

			expect( response[ '1-1' ] ).toHaveLength( 6 );
		} );

		test( 'should remove pending comments when they are received in items', () => {
			const state = deepFreeze( {
				'1-1': [ { ID: 1 }, { ID: 2 }, { ID: 3 } ],
			} );

			const response = pendingItems( state, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ { ID: 1 }, { ID: 2 } ],
			} );

			expect( response[ '1-1' ] ).toEqual( [ { ID: 3 } ] );
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

		test( 'should default to an empty object', () => {
			expect( fetchStatus( undefined, { type: 'okapi' } ) ).toEqual( {} );
		} );

		test( 'should set hasReceived and before/after when receiving commments', () => {
			const prevState = {};
			const nextState = fetchStatus( prevState, actionWithComments );
			expect( nextState ).toEqual( {
				[ `${ actionWithComments.siteId }-${ actionWithComments.postId }` ]: {
					before: false,
					after: true,
					hasReceivedBefore: true,
					hasReceivedAfter: false,
				},
			} );
		} );

		test( 'fetches by id should not modify the state', () => {
			const prevState = { [ actionWithCommentId.siteId ]: fetchStatusInitialState };
			const nextState = fetchStatus( prevState, actionWithCommentId );

			expect( nextState ).toEqual( prevState );
		} );
	} );

	describe( '#totalCommentsCount()', () => {
		test( 'should update post comments count', () => {
			const response = totalCommentsCount( undefined, {
				type: COMMENTS_COUNT_RECEIVE,
				totalCommentsCount: 123,
				siteId: 1,
				postId: 1,
			} );

			expect( response[ '1-1' ] ).toEqual( 123 );
		} );

		test( 'should increment post comment count', () => {
			const response = totalCommentsCount(
				{
					'1-1': 1,
				},
				{
					type: COMMENTS_COUNT_INCREMENT,
					siteId: 1,
					postId: 1,
				}
			);

			expect( response[ '1-1' ] ).toEqual( 2 );
		} );
	} );

	describe( '#treesInitialized()', () => {
		test( 'should track when a tree is initialized for a given query', () => {
			const state = treesInitialized( undefined, {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 77203074,
				status: 'unapproved',
			} );
			expect( state ).toEqual( {
				77203074: { unapproved: true },
			} );
		} );
		test( 'can track init status of many states', () => {
			const initState = deepFreeze( { 77203074: { unapproved: true } } );
			const state = treesInitialized( initState, {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 77203074,
				status: 'spam',
			} );
			expect( state ).toEqual( {
				77203074: { unapproved: true, spam: true },
			} );
		} );
		test( 'can track init status of many sites', () => {
			const initState = deepFreeze( { 77203074: { unapproved: true } } );
			const state = treesInitialized( initState, {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 2916284,
				status: 'unapproved',
			} );
			expect( state ).toEqual( {
				77203074: { unapproved: true },
				2916284: { unapproved: true },
			} );
		} );
	} );

	describe( '#expansions', () => {
		test( 'should default to an empty object', () => {
			const nextState = expansions( undefined, { type: '@@test/INIT' } );
			expect( nextState ).toEqual( {} );
		} );

		test( 'should ignore invalid display type', () => {
			const invalidDisplayType = expandComments( {
				siteId: 1,
				postId: 2,
				commentIds: [ 3 ],
				displayType: 'invalidDisplayType',
			} );

			const nextState = expansions( undefined, invalidDisplayType );
			expect( nextState ).toEqual( {} );
		} );

		test( 'should set commentIds to specified displayType', () => {
			const action = expandComments( {
				siteId: 1,
				postId: 2,
				commentIds: [ 3, 4, 5 ],
				displayType: 'is-full',
			} );

			const nextState = expansions( undefined, action );
			expect( nextState ).toEqual( {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-full',
					5: 'is-full',
				},
			} );
		} );

		test( 'setting new commentIds for a post should merge with what was already there', () => {
			const prevState = {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-full',
				},
			};

			const action = expandComments( {
				siteId: 1,
				postId: 2,
				commentIds: [ 5, 6 ],
				displayType: 'is-single-line',
			} );

			const nextState = expansions( prevState, action );
			expect( nextState ).toEqual( {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-full',
					5: 'is-single-line',
					6: 'is-single-line',
				},
			} );
		} );

		test( 'expandComments should only expand them, never unexpand', () => {
			const prevState = {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-single-line',
				},
			};

			const action = expandComments( {
				siteId: 1,
				postId: 2,
				commentIds: [ 3, 4 ],
				displayType: 'is-excerpt',
			} );

			const nextState = expansions( prevState, action );
			expect( nextState ).toEqual( {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-excerpt',
				},
			} );
		} );
	} );

	describe( '#activeReplies', () => {
		test( 'should set the active reply comment for a given site and post', () => {
			const prevState = {
				[ '1-2' ]: 123,
			};

			const action = setActiveReply( {
				siteId: 1,
				postId: 2,
				commentId: 124,
			} );

			const nextState = activeReplies( prevState, action );
			expect( nextState ).toEqual( {
				[ '1-2' ]: 124,
			} );
		} );

		test( 'should remove the given site and post from state entirely if commentId is null', () => {
			const prevState = {
				[ '1-2' ]: 123,
				[ '2-3' ]: 456,
			};

			const action = setActiveReply( {
				siteId: 1,
				postId: 2,
				commentId: null,
			} );

			const nextState = activeReplies( prevState, action );
			expect( nextState ).toEqual( {
				[ '2-3' ]: 456,
			} );
		} );
	} );

	describe( '#counts', () => {
		test( 'should add site counts', () => {
			const action = {
				type: COMMENT_COUNTS_UPDATE,
				siteId: 2916284,
				all: 11,
				approved: 5,
				pending: 6,
				postTrashed: 7,
				spam: 8,
				totalComments: 11,
				trash: 12,
			};
			const nextState = counts( undefined, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
		} );

		test( 'should add post-specific counts', () => {
			const action = {
				type: COMMENT_COUNTS_UPDATE,
				siteId: 2916284,
				postId: 234,
				all: 11,
				approved: 5,
				pending: 6,
				postTrashed: 7,
				spam: 8,
				totalComments: 11,
				trash: 12,
			};
			const nextState = counts( undefined, action );
			expect( nextState ).toEqual( {
				2916284: {
					234: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
		} );

		test( 'should accumulate counts', () => {
			const action = {
				type: COMMENT_COUNTS_UPDATE,
				siteId: 77203074,
				all: 11,
				approved: 5,
				pending: 6,
				postTrashed: 7,
				spam: 8,
				totalComments: 11,
				trash: 12,
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
				77203074: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
		} );

		test( 'should accumulate post counts', () => {
			const action = {
				type: COMMENT_COUNTS_UPDATE,
				siteId: 2916284,
				postId: 345,
				all: 11,
				approved: 5,
				pending: 6,
				postTrashed: 7,
				spam: 8,
				totalComments: 11,
				trash: 12,
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
					345: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
		} );

		test( 'should update filter counts', () => {
			const action = {
				type: COMMENT_COUNTS_UPDATE,
				siteId: 2916284,
				all: 1,
				approved: 2,
				pending: 3,
				postTrashed: 4,
				spam: 5,
				totalComments: 6,
				trash: 7,
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 7,
						spam: 8,
						totalComments: 11,
						trash: 12,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 1,
						approved: 2,
						pending: 3,
						postTrashed: 4,
						spam: 5,
						totalComments: 6,
						trash: 7,
					},
				},
			} );
		} );

		test( 'updates counts when a comment status changes', () => {
			const action = {
				type: COMMENTS_CHANGE_STATUS,
				siteId: 2916284,
				postId: 234,
				status: 'trash',
				meta: { comment: { previousStatus: 'unapproved' } },
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 0,
					},
					234: {
						all: 5,
						approved: 2,
						pending: 3,
						postTrashed: 0,
						spam: 1,
						totalComments: 6,
						trash: 0,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 10,
						approved: 5,
						pending: 5,
						postTrashed: 0,
						spam: 1,
						totalComments: 11,
						trash: 1,
					},
					234: {
						all: 4,
						approved: 2,
						pending: 2,
						postTrashed: 0,
						spam: 1,
						totalComments: 5,
						trash: 1,
					},
				},
			} );
		} );
		test( 'can update counts when only site counts are loaded', () => {
			const action = {
				type: COMMENTS_CHANGE_STATUS,
				siteId: 2916284,
				status: 'unapproved',
				meta: { comment: { previousStatus: 'approved' } },
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 0,
					},
				},
				77203074: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 0,
						totalComments: 11,
						trash: 0,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 11,
						approved: 4,
						pending: 7,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 0,
					},
				},
				77203074: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 0,
						totalComments: 11,
						trash: 0,
					},
				},
			} );
		} );

		test( 'updates counts when a comment is deleted', () => {
			const action = {
				type: COMMENTS_DELETE,
				siteId: 2916284,
				postId: 234,
				commentId: 2,
				meta: { comment: { previousStatus: 'trash' } },
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 10,
					},
					234: {
						all: 5,
						approved: 2,
						pending: 3,
						postTrashed: 0,
						spam: 1,
						totalComments: 6,
						trash: 4,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 9,
					},
					234: {
						all: 5,
						approved: 2,
						pending: 3,
						postTrashed: 0,
						spam: 1,
						totalComments: 6,
						trash: 3,
					},
				},
			} );
		} );

		test( 'updates counts when a comment is deleted from spam', () => {
			const action = {
				type: COMMENTS_DELETE,
				siteId: 2916284,
				postId: 234,
				commentId: 2,
				meta: { comment: { previousStatus: 'spam' } },
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 10,
					},
					234: {
						all: 5,
						approved: 2,
						pending: 3,
						postTrashed: 0,
						spam: 1,
						totalComments: 6,
						trash: 4,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 0,
						totalComments: 11,
						trash: 10,
					},
					234: {
						all: 5,
						approved: 2,
						pending: 3,
						postTrashed: 0,
						spam: 0,
						totalComments: 5,
						trash: 4,
					},
				},
			} );
		} );

		test( 'updates counts when a new comment is added', () => {
			const action = {
				type: COMMENTS_RECEIVE,
				siteId: 2916284,
				postId: 234,
				comments: [ { status: 'approved' } ],
				meta: { comment: { context: 'add' } },
			};
			const state = deepFreeze( {
				2916284: {
					site: {
						all: 11,
						approved: 5,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 12,
						trash: 10,
					},
					234: {
						all: 5,
						approved: 2,
						pending: 3,
						postTrashed: 0,
						spam: 1,
						totalComments: 6,
						trash: 4,
					},
				},
			} );
			const nextState = counts( state, action );
			expect( nextState ).toEqual( {
				2916284: {
					site: {
						all: 12,
						approved: 6,
						pending: 6,
						postTrashed: 0,
						spam: 1,
						totalComments: 13,
						trash: 10,
					},
					234: {
						all: 6,
						approved: 3,
						pending: 3,
						postTrashed: 0,
						spam: 1,
						totalComments: 7,
						trash: 4,
					},
				},
			} );
		} );
	} );
} );
