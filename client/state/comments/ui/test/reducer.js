/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_QUERY_UPDATE,
	COMMENTS_LIST_REQUEST,
} from 'calypso/state/action-types';
import { queries, pendingActions } from 'calypso/state/comments/ui/reducer';
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';

const siteId = 12345678;
const postId = 1234;
const comments = [ { ID: 1 }, { ID: 2 }, { ID: 3 }, { ID: 4 }, { ID: 5 } ];
const comments2 = [ { ID: 6 }, { ID: 7 }, { ID: 8 }, { ID: 9 }, { ID: 10 } ];
const comments3 = [ { ID: 11 }, { ID: 12 }, { ID: 13 }, { ID: 14 }, { ID: 15 } ];

describe( 'reducer', () => {
	describe( '#queries()', () => {
		test( 'should create a comments page for the site view with no filters', () => {
			const query = queries( undefined, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments,
				query: { page: 1 },
			} );
			expect( query ).toEqual( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
			} );
		} );

		test( 'should add a comments page for the post view with no filters', () => {
			const state = deepFreeze( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments: comments2,
				query: {
					page: 1,
					postId,
				},
			} );
			expect( query ).toEqual( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: { 'all?order=DESC': { 1: [ 6, 7, 8, 9, 10 ] } },
			} );
		} );

		test( 'should add a comments page for the post view with several filters', () => {
			const state = deepFreeze( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: { 'all?order=DESC': { 1: [ 6, 7, 8, 9, 10 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments: comments3,
				query: {
					order: 'ASC',
					page: 2,
					postId,
					search: 'foo',
					status: 'spam',
				},
			} );
			expect( query ).toEqual( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: {
					'all?order=DESC': { 1: [ 6, 7, 8, 9, 10 ] },
					'spam?order=ASC&s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
				},
			} );
		} );

		test( 'should replace a comments page after a new request', () => {
			const state = deepFreeze( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: {
					'all?order=DESC': { 1: [ 6, 7, 8, 9, 10 ] },
					'spam?order=ASC&s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
				},
			} );
			const query = queries( state, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments: comments3,
				query: { page: 1 },
			} );
			expect( query ).toEqual( {
				site: { 'all?order=DESC': { 1: [ 11, 12, 13, 14, 15 ] } },
				[ postId ]: {
					'all?order=DESC': { 1: [ 6, 7, 8, 9, 10 ] },
					'spam?order=ASC&s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
				},
			} );
		} );

		test( 'should remove a comment from a page when the comment is deleted', () => {
			const state = deepFreeze( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_DELETE,
				siteId,
				commentId: 5,
				refreshCommentListQuery: { page: 1, status: 'all' },
			} );
			expect( query ).toEqual( { site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4 ] } } } );
		} );

		test( 'should remove a comment from a page when the comment status is changed', () => {
			const state = deepFreeze( {
				site: { 'spam?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 5,
				status: 'approved',
				refreshCommentListQuery: { page: 1, status: 'spam' },
			} );
			expect( query ).toEqual( { site: { 'spam?order=DESC': { 1: [ 1, 2, 3, 4 ] } } } );
		} );

		test( 'should not remove a comment from a page when the comment status is changed but it does not change filter list', () => {
			const state = deepFreeze( {
				site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 5,
				status: 'approved',
				refreshCommentListQuery: { page: 1, status: 'all' },
			} );
			expect( query ).toEqual( { site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } } } );
		} );

		test( 'should add back a comment on undo in DESC order', () => {
			const state = deepFreeze( {
				site: { 'all?order=DESC': { 1: [ 5, 4, 2, 1 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 3,
				status: 'approved',
				refreshCommentListQuery: { page: 1, status: 'all', order: 'DESC' },
			} );
			expect( query ).toEqual( { site: { 'all?order=DESC': { 1: [ 5, 4, 3, 2, 1 ] } } } );
		} );

		test( 'should add back a comment on undo in ASC order', () => {
			const state = deepFreeze( {
				site: { 'all?order=ASC': { 1: [ 1, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 2,
				status: 'approved',
				refreshCommentListQuery: { page: 1, status: 'all', order: 'ASC' },
			} );
			expect( query ).toEqual( { site: { 'all?order=ASC': { 1: [ 1, 2, 3, 4, 5 ] } } } );
		} );

		test( 'should update on undo in a tab other than all', () => {
			const state = deepFreeze( {
				site: { 'approved?order=ASC': { 1: [ 1, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 2,
				status: 'approved',
				refreshCommentListQuery: { page: 1, status: 'approved', order: 'ASC' },
			} );
			expect( query ).toEqual( { site: { 'approved?order=ASC': { 1: [ 1, 2, 3, 4, 5 ] } } } );
		} );

		test( 'should update the view when a bulk action occurs', () => {
			const state = deepFreeze( {
				site: { 'approved?order=ASC': { 1: [ 1, 3, 4, 5 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 4,
				status: 'unapproved',
				meta: { comment: { commentsListQuery: { page: 1, status: 'approved', order: 'ASC' } } },
			} );
			expect( query ).toEqual( { site: { 'approved?order=ASC': { 1: [ 1, 3, 5 ] } } } );
		} );
	} );
	describe( '#pendingActions', () => {
		test( 'should keep track of pending comment action', () => {
			const action = {
				type: COMMENTS_CHANGE_STATUS,
				commentId: 1,
				status: 'approved',
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			};
			const state = pendingActions( undefined, action );
			expect( state ).toEqual( [ getRequestKey( action ) ] );
		} );
		test( 'should keep track of pending comment actions', () => {
			const approveAction = {
				type: COMMENTS_CHANGE_STATUS,
				commentId: 1,
				status: 'approved',
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			};
			const deleteComment = {
				type: COMMENTS_DELETE,
				commentId: 2,
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			};
			const state = deepFreeze( [ getRequestKey( approveAction ) ] );
			const nextState = pendingActions( state, deleteComment );
			expect( nextState ).toEqual( [
				getRequestKey( approveAction ),
				getRequestKey( deleteComment ),
			] );
		} );
		test( 'does not update when we are not tracking the request', () => {
			const action = {
				type: COMMENTS_CHANGE_STATUS,
				commentId: 1,
				status: 'approved',
			};
			const state = pendingActions( undefined, action );
			expect( state ).toEqual( [] );
		} );
		test( 'clears current pending requests when we detect a fresh view', () => {
			const action = {
				type: COMMENTS_CHANGE_STATUS,
				commentId: 1,
				status: 'approved',
				meta: {
					dataLayer: {
						trackRequest: true,
					},
				},
			};
			const state = pendingActions( deepFreeze( [ getRequestKey( action ) ] ), {
				type: COMMENTS_LIST_REQUEST,
			} );
			expect( state ).toEqual( [] );
		} );
	} );
} );
