/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisions from 'state/selectors/get-post-revisions';

describe( 'getPostRevisions', () => {
	test( 'should return an empty array if there is no revision in the state for `siteId, postId`', () => {
		expect(
			getPostRevisions(
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

	test( 'should return an array of post revisions', () => {
		expect(
			getPostRevisions(
				{
					posts: {
						revisions: {
							diffs: {
								12345678: {
									10: {
										revisions: [
											{
												'11:12': {
													id: 11,
													post_author: 99499,
													post_title: 'Badman <img onerror= />',
												},
											},
										],
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
				10
			)
		).to.eql( [
			{
				'11:12': {
					id: 11,
					post_author: 99499,
					post_title: 'Badman <img onerror= />',
				},
			},
		] );
	} );
} );
