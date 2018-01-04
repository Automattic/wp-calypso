/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_PROGRESS_UPDATE,
	COMMENTS_QUERY_UPDATE,
} from 'state/action-types';
import { progresses, queries } from 'state/ui/comments/reducer';

const siteId = 12345678;
const postId = 1234;
const comments = [ { ID: 1 }, { ID: 2 }, { ID: 3 }, { ID: 4 }, { ID: 5 } ];
const comments2 = [ { ID: 6 }, { ID: 7 }, { ID: 8 }, { ID: 9 }, { ID: 10 } ];
const comments3 = [ { ID: 11 }, { ID: 12 }, { ID: 13 }, { ID: 14 }, { ID: 15 } ];

describe( 'reducer', () => {
	describe( '#progresses()', () => {
		test( 'should create a progress object for a given site', () => {
			const progress = progresses( undefined, {
				type: COMMENTS_CHANGE_STATUS,
				siteId,
				commentId: 5,
				status: 'approved',
				refreshCommentListQuery: { progressId: 1, progressTotal: 1 },
			} );
			expect( progress ).to.eql( {
				1: {
					count: 0,
					failed: false,
					status: 'approved',
					total: 1,
				},
			} );
		} );

		test( 'should increase a progress', () => {
			const state = deepFreeze( {
				1: { count: 1, failed: false, total: 10 },
			} );
			const progress = progresses( state, {
				type: COMMENTS_PROGRESS_UPDATE,
				siteId,
				progressId: 1,
			} );
			expect( progress ).to.eql( { 1: { count: 2, failed: false, total: 10 } } );
		} );

		test( 'should report a failure', () => {
			const state = deepFreeze( {
				1: { count: 1, failed: false, total: 10 },
			} );
			const progress = progresses( state, {
				type: COMMENTS_PROGRESS_UPDATE,
				siteId,
				progressId: 1,
				options: { failed: true },
			} );
			expect( progress ).to.eql( { 1: { count: 2, failed: true, total: 10 } } );
		} );

		test( 'should clear all the completed progresses', () => {
			const state = deepFreeze( {
				1: { count: 1, failed: false, total: 1 },
				2: { count: 2, failed: false, total: 2 },
				3: { count: 1, failed: false, total: 3 },
			} );
			const progress = progresses( state, {
				type: COMMENTS_PROGRESS_UPDATE,
				siteId,
				progressId: 3,
			} );
			expect( progress ).to.eql( { 3: { count: 2, failed: false, total: 3 } } );
		} );
	} );

	describe( '#queries()', () => {
		test( 'should create a comments page for the site view with no filters', () => {
			const query = queries( undefined, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments,
				query: { page: 1 },
			} );
			expect( query ).to.eql( {
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
			expect( query ).to.eql( {
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
			expect( query ).to.eql( {
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
			expect( query ).to.eql( {
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
			expect( query ).to.eql( { site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4 ] } } } );
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
			expect( query ).to.eql( { site: { 'spam?order=DESC': { 1: [ 1, 2, 3, 4 ] } } } );
		} );

		test( "should not remove a comment from a page when the comment status is changed but it doesn't change filter list", () => {
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
			expect( query ).to.eql( { site: { 'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] } } } );
		} );
	} );
} );
