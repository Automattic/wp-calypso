/**
 * Internal dependencies
 */
import { getSiteCommentCounts } from 'calypso/state/comments/selectors';

describe( 'getSiteCommentCounts()', () => {
	const siteId = 2916284;

	test( 'should return site counts given a site ID', () => {
		const state = {
			comments: {
				counts: {
					[ siteId ]: {
						site: {
							all: 5,
							approved: 2,
							pending: 3,
						},
					},
				},
			},
		};
		const output = getSiteCommentCounts( state, siteId );
		expect( output ).toEqual( {
			all: 5,
			approved: 2,
			pending: 3,
		} );
	} );

	test( 'should return site counts given a site ID and a post ID', () => {
		const state = {
			comments: {
				counts: {
					[ siteId ]: {
						12345: {
							all: 5,
							approved: 2,
							pending: 3,
						},
					},
				},
			},
		};
		const output = getSiteCommentCounts( state, siteId, 12345 );
		expect( output ).toEqual( {
			all: 5,
			approved: 2,
			pending: 3,
		} );
	} );

	test( 'should return null when counts are not available', () => {
		const state = {
			comments: {
				counts: {},
			},
		};
		const output = getSiteCommentCounts( state, siteId, 12345 );
		expect( output ).toEqual( null );
	} );
} );
