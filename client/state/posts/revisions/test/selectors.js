/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPostRevision,
	getPostRevisionChanges,
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

	describe( 'getPostRevisionChanges', () => {
		const outOfOrderState = {
			posts: {
				revisions: {
					revisions: {
						12345678: {
							10: {
								// NOTE: those are voluntarily out of order,
								// to test that we're selecting the right
								// base revision when computing changes.
								13: {
									id: 13,
									date: '2017-04-21T13:13:13Z',
									content: 'World',
								},
								11: {
									id: 11,
									date: '2017-04-21T11:11:11Z',
									content: 'Hello World',
								},
								12: {
									id: 12,
									author: 2,
									date: '2017-04-21T12:12:12Z',
									content: 'Hello',
								},
							},
						},
					},
				},
			},
			users: {
				items: {},
			},
		};

		it( 'should return an empty array if the revision is not found', () => {
			expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 14 ) ).to.eql( [] );
		} );

		it( 'should compute diff changes based on revision dates', () => {
			expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 12 ) ).to.eql( [
				{
					count: 1,
					value: 'Hello',
				},
				{
					count: 2,
					removed: true,
					value: ' World',
				},
			] );
		} );

		it( 'should compute diff changes for the oldest revision available against a clean slate', () => {
			expect( getPostRevisionChanges( outOfOrderState, 12345678, 10, 11 ) ).to.eql( [
				{
					added: true,
					value: 'Hello World',
				},
			] );
		} );
	} );
} );
