/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCommentsPage from 'calypso/state/selectors/get-comments-page';

const SITE_ID = 12345678;
const POST_ID = 1234;

describe( 'getCommentsPage()', () => {
	const state = {
		comments: {
			ui: {
				queries: {
					[ SITE_ID ]: {
						site: {
							'all?order=DESC': { 1: [ 1, 2, 3, 4, 5 ] },
							'trash?order=DESC': { 1: [] },
						},
						[ POST_ID ]: {
							'all?order=DESC': { 1: [ 6, 7, 8, 9, 10 ] },
							'spam?order=ASC&s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
						},
					},
				},
			},
		},
	};

	test( 'should return undefined if the state is not initialized for the requested filter', () => {
		const commentsPage = getCommentsPage( state, SITE_ID, { page: 10, status: 'all' } );
		expect( commentsPage ).to.be.undefined;
	} );

	test( 'should return an empty array if the state is empty for the requested filters', () => {
		const commentsPage = getCommentsPage( state, SITE_ID, { page: 1, status: 'trash' } );
		expect( commentsPage ).to.eql( [] );
	} );

	test( 'should return the first comments page of site view', () => {
		const commentsPage = getCommentsPage( state, SITE_ID, {} );
		expect( commentsPage ).to.eql( [ 1, 2, 3, 4, 5 ] );
	} );

	test( 'should return the first comments page of post view', () => {
		const commentsPage = getCommentsPage( state, SITE_ID, {
			page: 1,
			postId: POST_ID,
			status: 'all',
		} );
		expect( commentsPage ).to.eql( [ 6, 7, 8, 9, 10 ] );
	} );

	test( 'should return a comments page based on several filters', () => {
		const commentsPage = getCommentsPage( state, SITE_ID, {
			order: 'ASC',
			page: 2,
			postId: POST_ID,
			search: 'foo',
			status: 'spam',
		} );
		expect( commentsPage ).to.eql( [ 11, 12, 13, 14, 15 ] );
	} );
} );
