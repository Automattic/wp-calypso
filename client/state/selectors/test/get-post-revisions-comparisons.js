/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPostRevisionsComparisons } from 'calypso/state/posts/selectors/get-post-revisions-comparisons';

describe( 'getPostRevisionsComparisons', () => {
	test( 'should return an empty object if there are no revisions in the state for `siteId, postId`', () => {
		expect(
			getPostRevisionsComparisons(
				{
					posts: {
						revisions: {
							12345678: {
								10: {
									revisions: {},
								},
							},
						},
					},
				},
				12345678,
				10
			)
		).to.eql( {} );
	} );

	test( 'should return a map of revision id to its valid (sequential) comparisons for `siteId, postId`', () => {
		const selection = getPostRevisionsComparisons(
			{
				posts: {
					revisions: {
						diffs: {
							12345678: {
								10: {
									'0:13': {
										diff: {
											post_content: [ { op: 'add', value: 'older content' } ],
											post_title: [ { op: 'add', value: 'post title' } ],
											totals: { add: 4 },
										},
										from: 0,
										to: 13,
									},
									'13:22': {
										diff: {
											post_content: [
												{ op: 'copy', value: 'post title' },
												{ op: 'add', value: '\n\nand newer' },
											],
											post_title: [ { op: 'copy', value: 'post title' } ],
											totals: { add: 2 },
										},
										from: 13,
										to: 22,
									},
									revisions: {
										13: {
											post_date_gmt: '2017-11-15 18:13:49Z',
											post_modified_gmt: '2017-11-15 18:13:49Z',
											post_author: '20416304',
											id: 13,
											post_content: 'older content',
											post_excerpt: '',
											post_title: 'test post',
										},
										22: {
											post_date_gmt: '2017-12-13 00:12:10Z',
											post_modified_gmt: '2017-12-13 00:12:10Z',
											post_author: '20416304',
											id: 22,
											post_content: 'older content\n\nand newer!',
											post_excerpt: '',
											post_title: 'test post',
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
		);

		expect( selection ).to.eql( {
			13: {
				diff: {
					post_content: [ { op: 'add', value: 'older content' } ],
					post_title: [ { op: 'add', value: 'post title' } ],
					totals: { add: 4 },
				},
				nextRevisionId: 22,
				prevRevisionId: undefined,
			},
			22: {
				diff: {
					post_content: [
						{ op: 'copy', value: 'post title' },
						{ op: 'add', value: '\n\nand newer' },
					],
					post_title: [ { op: 'copy', value: 'post title' } ],
					totals: { add: 2 },
				},
				nextRevisionId: undefined,
				prevRevisionId: 13,
			},
		} );
	} );
} );
