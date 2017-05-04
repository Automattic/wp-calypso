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
				users: {
					items: {},
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
				users: {
					items: {},
				},
			}, 12345678, 10, 11 ) ).to.eql( {
				id: 11,
				title: 'Badman <img onerror= />',
			} );
		} );

		it( 'should hydrate the revision with more author information if it can be found in the state', () => {
			expect( getPostRevision( {
				posts: {
					revisions: {
						revisions: {
							12345678: {
								10: {
									11: {
										id: 11,
										author: 1,
									},
								},
							},
						},
					},
				},
				users: {
					items: {
						1: {
							name: 'Alice Bob'
						},
					},
				},
			}, 12345678, 10, 11 ) ).to.eql( {
				id: 11,
				author: {
					name: 'Alice Bob',
				},
			} );
		} );

		it( 'should preserve a revision author ID if it can\'t find more information about the author', () => {
			expect( getPostRevision( {
				posts: {
					revisions: {
						revisions: {
							12345678: {
								10: {
									11: {
										id: 11,
										author: 1,
									},
								},
							},
						},
					},
				},
				users: {
					items: {},
				},
			}, 12345678, 10, 11 ) ).to.eql( {
				id: 11,
				author: 1,
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
				users: {
					items: {},
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
				users: {
					items: {},
				},
			}, 12345678, 10 ) ).to.eql( [
				{
					id: 11,
					title: 'Badman <img onerror= />',
				},
			] );
		} );

		it( 'should hydrate all revisions with more author information if found', () => {
			expect( getPostRevisions( {
				posts: {
					revisions: {
						revisions: {
							12345678: {
								10: {
									11: {
										id: 11,
										author: 1,
									},
									12: {
										id: 12,
										author: 2,
									},
								},
							},
						},
					},
				},
				users: {
					items: {
						1: {
							name: 'Alice Bob'
						},
						2: {
							name: 'Carol Dan',
						},
					},
				},
			}, 12345678, 10 ) ).to.eql( [
				{
					id: 11,
					author: {
						name: 'Alice Bob',
					},
				},
				{
					id: 12,
					author: {
						name: 'Carol Dan',
					},
				},
			] );
		} );

		it( 'should preserve all revisions author ID if not found', () => {
			expect( getPostRevisions( {
				posts: {
					revisions: {
						revisions: {
							12345678: {
								10: {
									11: {
										id: 11,
										author: 1,
									},
									12: {
										id: 12,
										author: 2,
									}
								},
							},
						},
					},
				},
				users: {
					items: {},
				},
			}, 12345678, 10 ) ).to.eql( [
				{
					id: 11,
					author: 1,
				},
				{
					id: 12,
					author: 2,
				}
			] );
		} );
	} );
} );
