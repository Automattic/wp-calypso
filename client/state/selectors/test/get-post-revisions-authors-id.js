/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPostRevisionsAuthorsId } from 'calypso/state/posts/selectors/get-post-revisions-authors-id';

describe( 'getPostRevisionsAuthorsId', () => {
	test( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
		expect(
			getPostRevisionsAuthorsId(
				{
					posts: {
						revisions: {
							diffs: {
								12345678: {
									10: {
										revisions: {},
									},
								},
							},
						},
					},
				},
				12345678,
				10
			)
		).to.eql( [] );
	} );

	test( 'should return an array of post revisions authors ID', () => {
		expect(
			getPostRevisionsAuthorsId(
				{
					posts: {
						revisions: {
							diffs: {
								12345678: {
									10: {
										revisions: {
											11: {
												post_author: '123',
											},
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
