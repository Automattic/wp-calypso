/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisions from 'state/selectors/get-post-revisions';

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

	it( 'should normalize all revisions', () => {
		expect( getPostRevisions( {
			posts: {
				revisions: {
					revisions: {
						12345678: {
							10: {
								11: {
									id: 11,
									title: '&acute;',
								},
								12: {
									id: 12,
									title: '&grave;',
								}
							},
						},
					},
				},
			},
			users: {
				items: {},
			},
		}, 12345678, 10, 'editing' ) ).to.eql( [
			{
				id: 11,
				title: '´',
			},
			{
				id: 12,
				title: '`',
			}
		] );
	} );

	it( 'should order revisions by date (recent first)', () => {
		expect( getPostRevisions( {
			posts: {
				revisions: {
					revisions: {
						12345678: {
							10: {
								12: {
									id: 12,
									date: '2017-07-07T12:44:00Z',
								},
								11: {
									id: 11,
									date: '2017-07-06T12:44:00Z',
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
				id: 12,
				date: '2017-07-07T12:44:00Z',
			},
			{
				id: 11,
				date: '2017-07-06T12:44:00Z',
			}
		] );
	} );
} );
