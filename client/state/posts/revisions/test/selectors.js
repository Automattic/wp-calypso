/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPostRevision,
	getPostRevisions,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getPostRevision', () => {
		it( 'should return `null` if there is no revision in the state for `siteId, postId`', () => {
			expect( getPostRevision( {
				posts: {
					revisions: {
						revisions: {},
					},
				},
			}, 12345678, 10, 10 ) ).to.be.null;
		} );

		it( 'should return a post revision', () => {
			expect( getPostRevision( {
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
			}, 12345678, 10, 11 ) ).to.eql( {
				id: 11,
				title: 'Badman <img onerror= />',
			} );
		} );
	} );

	describe( 'getPostRevisions', () => {
		it( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
			expect( getPostRevisions( {
				posts: {
					revisions: {
						revisions: {},
					},
				},
			}, 12345678, 10 ) ).to.eql( [] );
		} );

		it( 'should return an array of post revisions', () => {
			expect( getPostRevisions( {
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
			}, 12345678, 10 ) ).to.eql( [
				{
					id: 11,
					title: 'Badman <img onerror= />',
				},
			] );
		} );
	} );
} );
