/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getNormalizedPostRevision,
	getNormalizedPostRevisions,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getNormalizedPostRevision', () => {
		it( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
			const postRevision = getNormalizedPostRevision( {
				posts: {
					revisions: {
						revisions: {},
					},
				},
			}, 12345678, 10, 10 );

			expect( postRevision ).to.be.null;
		} );

		it( 'should return a normalized post revision', () => {
			const postRevisions = getNormalizedPostRevision( {
				posts: {
					revisions: {
						revisions: {
							12345678: {
								10: {
									11: {
										id: 11,
										title: 'Badman <img onerror= />',
									},
								},
							},
						},
					},
				},
			}, 12345678, 10, 11 );

			expect( postRevisions ).to.eql( {
				id: 11,
				title: 'Badman ',
			} );
		} );
	} );

	describe( 'getNormalizedPostRevisions', () => {
		it( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
			const postRevisions = getNormalizedPostRevisions( {
				posts: {
					revisions: {
						revisions: {},
					},
				},
			}, 12345678, 10 );

			expect( postRevisions ).to.eql( [] );
		} );

		it( 'should return an array of normalized post revisions', () => {
			const postRevisions = getNormalizedPostRevisions( {
				posts: {
					revisions: {
						revisions: {
							12345678: {
								10: {
									11: {
										id: 11,
										title: 'Badman <img onerror= />',
									},
								},
							},
						},
					},
				},
			}, 12345678, 10 );

			expect( postRevisions ).to.eql( [
				{
					id: 11,
					title: 'Badman ',
				},
			] );
		} );
	} );
} );
