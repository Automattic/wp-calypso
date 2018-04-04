/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisionsComparisonsMajor from 'state/selectors/get-post-revisions-comparisons-major';

describe( 'getPostRevisionsComparisonsMajor', () => {
	test( 'should return an empty object if there are no revisions in the state for `siteId, postId`', () => {
		expect(
			getPostRevisionsComparisonsMajor(
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

	test(
		'should return a map of revision id to its valid (sequential) comparisons for `siteId, postId`,' +
			' omitting revisions with empty diff totals',
		() => {
			const selection = getPostRevisionsComparisonsMajor(
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
												post_content: [ { op: 'copy', value: 'older content' } ],
												post_title: [ { op: 'copy', value: 'post title' } ],
												totals: {},
											},
											from: 13,
											to: 22,
										},
										'22:25': {
											diff: {
												post_content: [
													{ op: 'copy', value: 'older' },
													{ op: 'del', value: ' content' },
												],
												post_title: [ { op: 'copy', value: 'post title' } ],
												totals: { del: 1 },
											},
											from: 22,
											to: 25,
										},
										revisions: {
											13: {
												post_date_gmt: '2017-11-15 18:13:49Z',
												post_modified_gmt: '2017-11-15 18:13:49Z',
												post_author: '20416304',
												id: 13,
												post_content: 'older content',
												post_excerpt: '',
												post_title: 'post title',
											},
											22: {
												post_date_gmt: '2017-12-13 00:12:10Z',
												post_modified_gmt: '2017-12-13 00:12:10Z',
												post_author: '20416304',
												id: 22,
												post_content: 'older content',
												post_excerpt: '',
												post_title: 'post title',
											},
											25: {
												post_date_gmt: '2017-12-19 02:24:09Z',
												post_modified_gmt: '2017-12-19 02:24:09Z',
												post_author: '20830298',
												id: 25,
												post_content: 'older',
												post_excerpt: '',
												post_title: 'post title',
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
					nextRevisionId: 25,
					prevRevisionId: undefined,
				},
				25: {
					diff: {
						post_content: [ { op: 'copy', value: 'older' }, { op: 'del', value: ' content' } ],
						post_title: [ { op: 'copy', value: 'post title' } ],
						totals: { del: 1 },
					},
					nextRevisionId: undefined,
					prevRevisionId: 13,
				},
			} );
		}
	);
} );
