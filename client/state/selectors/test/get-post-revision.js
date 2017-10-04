/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevision from 'state/selectors/get-post-revision';

describe( 'getPostRevision', () => {
	it( 'should return `null` if there is no revision in the state for `siteId, postId`', () => {
		expect(
			getPostRevision(
				{
					posts: {
						revisions: {
							revisions: {},
						},
					},
					users: {
						items: {},
					},
				},
				12345678,
				10,
				10
			)
		).to.be.null;
	} );

	it( 'should return a post revision', () => {
		expect(
			getPostRevision(
				{
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
				},
				12345678,
				10,
				11
			)
		).to.eql( {
			id: 11,
			title: 'Badman <img onerror= />',
		} );
	} );

	it( 'should hydrate the revision with more author information if it can be found in the state', () => {
		expect(
			getPostRevision(
				{
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
								name: 'Alice Bob',
							},
						},
					},
				},
				12345678,
				10,
				11
			)
		).to.eql( {
			id: 11,
			author: {
				name: 'Alice Bob',
			},
		} );
	} );

	it( "should preserve a revision author ID if it can't find more information about the author", () => {
		expect(
			getPostRevision(
				{
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
				},
				12345678,
				10,
				11
			)
		).to.eql( {
			id: 11,
			author: 1,
		} );
	} );

	it( 'should normalize the revision', () => {
		expect(
			getPostRevision(
				{
					posts: {
						revisions: {
							revisions: {
								12345678: {
									10: {
										11: {
											id: 11,
											title: '&acute;',
										},
									},
								},
							},
						},
					},
					users: {
						items: {},
					},
				},
				12345678,
				10,
				11,
				'editing'
			)
		).to.eql( {
			id: 11,
			title: '´',
		} );
	} );
} );
