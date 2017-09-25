/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { map, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_LIKE, COMMENTS_UNLIKE, COMMENTS_ERROR, COMMENTS_COUNT_INCREMENT, COMMENTS_COUNT_RECEIVE, COMMENTS_RECEIVE, COMMENTS_DELETE, COMMENTS_TREE_SITE_ADD, COMMENTS_EDIT } from '../../action-types';
import { expandComments } from '../actions';
import { PLACEHOLDER_STATE } from '../constants';
import { items, expansions, totalCommentsCount, fetchStatus, fetchStatusInitialState, treesInitialized } from '../reducer';

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
		it( 'should build an ordered by date list', () => {
			const response = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: 1,
				postId: 1,
				comments: [ ...commentsNestedTree ].sort( () => ( ( Math.random() * 2 ) % 2 ? -1 : 1 ) ),
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

		it( 'should edit a comment by id', () => {
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

			expect( result ).to.eql( { '1-1': [ { ID: 123, content: 'lorem ipsum dolor' } ] } );
			expect( result[ '1-1' ] ).to.have.lengthOf( 1 );
		} );

		it( 'should allow Comment Management to edit content and author details', () => {
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

			expect( result ).to.eql( {
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
			expect( result[ '1-1' ] ).to.have.lengthOf( 1 );
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
				}
			);

			expect( response[ '1-1' ] ).to.eql( 2 );
		} );
	} );

	describe( '#treesInitialized()', () => {
		it( 'should track when a tree is initialized for a given query', () => {
			const state = treesInitialized( undefined, {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 77203074,
				status: 'unapproved',
			} );
			expect( state ).to.eql( {
				77203074: { unapproved: true },
			} );
		} );
		it( 'can track init status of many states', () => {
			const initState = deepFreeze( { 77203074: { unapproved: true } } );
			const state = treesInitialized( initState, {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 77203074,
				status: 'spam',
			} );
			expect( state ).to.eql( {
				77203074: { unapproved: true, spam: true },
			} );
		} );
		it( 'can track init status of many sites', () => {
			const initState = deepFreeze( { 77203074: { unapproved: true } } );
			const state = treesInitialized( initState, {
				type: COMMENTS_TREE_SITE_ADD,
				siteId: 2916284,
				status: 'unapproved',
			} );
			expect( state ).to.eql( {
				77203074: { unapproved: true },
				2916284: { unapproved: true },
			} );
		} );
	} );

	describe( '#expansions', () => {
		it( 'should default to an empty object', () => {
			const nextState = expansions( undefined, { type: '@@test/INIT' } );
			expect( nextState ).to.eql( {} );
		} );

		it( 'should ignore invalid display type', () => {
			const invalidDisplayType = expandComments( {
				siteId: 1,
				postId: 2,
				commentIds: [ 3 ],
				displayType: 'invalidDisplayType',
			} );

			const nextState = expansions( undefined, invalidDisplayType );
			expect( nextState ).to.eql( {} );
		} );

		it( 'should set commentIds to specified displayType', () => {
			const action = expandComments( {
				siteId: 1,
				postId: 2,
				commentIds: [ 3, 4, 5 ],
				displayType: 'is-full',
			} );

			const nextState = expansions( undefined, action );
			expect( nextState ).to.eql( {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-full',
					5: 'is-full',
				},
			} );
		} );

		it( 'setting new commentIds for a post should merge with what was already there', () => {
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
			expect( nextState ).to.eql( {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-full',
					5: 'is-single-line',
					6: 'is-single-line',
				},
			} );
		} );
		it( 'expandComments should only expand them, never unexpand', () => {
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
			expect( nextState ).to.eql( {
				[ '1-2' ]: {
					3: 'is-full',
					4: 'is-excerpt',
				},
			} );
		} );
	} );
} );
