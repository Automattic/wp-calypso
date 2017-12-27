/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCommentsPage } from 'state/selectors';

const SITE_ID = 12345678;
const POST_ID = 1234;

describe( 'getCommentsPage()', () => {
	const state = {
		ui: {
			comments: {
				queries: {
					[ SITE_ID ]: {
						site: { all: { 1: [ 1, 2, 3, 4, 5 ] } },
						[ POST_ID ]: {
							all: { 1: [ 6, 7, 8, 9, 10 ] },
							'spam?s=foo': { 2: [ 11, 12, 13, 14, 15 ] },
						},
					},
				},
			},
		},
	};

	test( 'should return an empty array if there is state is empty for the requested filters', () => {
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
			page: 2,
			postId: POST_ID,
			search: 'foo',
			status: 'spam',
		} );
		expect( commentsPage ).to.eql( [ 11, 12, 13, 14, 15 ] );
	} );
} );
