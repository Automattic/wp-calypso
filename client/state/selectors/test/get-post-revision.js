/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPostRevision } from 'calypso/state/posts/selectors/get-post-revision';

describe( 'getPostRevision', () => {
	test( 'should return `null` if there is no revision in the state for `siteId, postId`', () => {
		expect(
			getPostRevision(
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
				10,
				7979
			)
		).to.be.null;
	} );

	test( 'should return a post revision', () => {
		expect(
			getPostRevision(
				{
					posts: {
						revisions: {
							diffs: {
								12345678: {
									10: {
										revisions: {
											11: {
												id: 11,
												post_author: 9090,
												post_title: 'Badman <img onerror= />',
											},
										},
									},
								},
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
			post_author: 9090,
			post_title: 'Badman <img onerror= />',
		} );
	} );
} );
