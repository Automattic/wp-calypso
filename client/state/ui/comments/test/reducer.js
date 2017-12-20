/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { COMMENTS_QUERY_UPDATE } from 'state/action-types';
import { queries } from 'state/ui/comments/reducer';

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
			expect( query ).to.eql( {
				site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
			} );
		} );

		test( 'should add a comments page for the post view with no filters', () => {
			const state = deepFreeze( {
				site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
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
				site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: { all: { 1: [ 6, 7, 8, 9, 10 ] } },
			} );
		} );

		test( 'should add a comments page for the post view with several filters', () => {
			const state = deepFreeze( {
				site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: { all: { 1: [ 6, 7, 8, 9, 10 ] } },
			} );
			const query = queries( state, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments: comments3,
				query: {
					page: 2,
					postId,
					search: 'foo',
					status: 'spam',
				},
			} );
			expect( query ).to.eql( {
				site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: {
					all: { 1: [ 6, 7, 8, 9, 10 ] },
					'spam?s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
				},
			} );
		} );

		test( 'should replace a comments page after a new request', () => {
			const state = deepFreeze( {
				site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
				[ postId ]: {
					all: { 1: [ 6, 7, 8, 9, 10 ] },
					'spam?s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
				},
			} );
			const query = queries( state, {
				type: COMMENTS_QUERY_UPDATE,
				siteId,
				comments: comments3,
				query: { page: 1 },
			} );
			expect( query ).to.eql( {
				site: { all: { 1: [ 11, 12, 13, 14, 15 ] } },
				[ postId ]: {
					all: { 1: [ 6, 7, 8, 9, 10 ] },
					'spam?s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
				},
			} );
		} );
	} );
} );
