/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisionsAuthorsId from 'state/selectors/get-post-revisions-authors-id';

describe( 'getPostRevisionsAuthorsId', () => {
	it( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
		expect(
			getPostRevisionsAuthorsId(
				{
					posts: {
						revisions: {
							revisions: {},
						},
					},
				},
				12345678,
				10
			)
		).to.eql( [] );
	} );

	it( 'should return an array of post revisions authors ID', () => {
		expect(
			getPostRevisionsAuthorsId(
				{
					posts: {
						revisions: {
							revisions: {
								12345678: {
									10: {
										11: {
											author: 123,
										},
									},
								},
							},
						},
					},
				},
				12345678,
				10
			)
		).to.eql( [ 123 ] );
	} );
} );
