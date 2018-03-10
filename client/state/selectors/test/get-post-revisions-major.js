/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPostRevisionsMajor from 'state/selectors/get-post-revisions-major';

describe( 'getPostRevisionsMajor', () => {
	test( 'should return an empty array if there are no revisions in the state for `siteId, postId`', () => {
		expect(
			getPostRevisionsMajor(
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
		).to.eql( [] );
	} );

	test(
		'should return a sorted array of revisions,' +
			' excluding revisions with no changes to post_title or post_content',
		() => {
			expect(
				getPostRevisionsMajor(
					{
						posts: {
							revisions: {
								diffs: {
									12345678: {
										10: {
											revisions: {
												168: {
													post_date_gmt: '2017-12-12 18:24:37Z',
													post_modified_gmt: '2017-12-12 18:24:37Z',
													post_author: '20416304',
													id: 168,
													post_content: 'I must here speak by theory alone.',
													post_excerpt: '',
													post_title: 'In my eyes it bore a livelier image of the spirit',
												},
												169: {
													post_date_gmt: '2017-12-14 18:24:37Z',
													post_modified_gmt: '2017-12-14 18:24:37Z',
													post_author: '20416304',
													id: 169,
													post_content: 'I must here speak by theory alone.',
													post_excerpt: '',
													post_title: 'In my eyes it bore a livelier image of the spirit',
												},
												170: {
													post_date_gmt: '2018-01-02 07:01:19Z',
													post_modified_gmt: '2018-01-02 07:01:19Z',
													post_author: '20416304',
													id: 170,
													post_content: 'I must here speak by theory.',
													post_excerpt: '',
													post_title: 'In my eyes it bore a livelier image of the spirit',
												},
												172: {
													post_date_gmt: '2018-01-03 09:01:00Z',
													post_modified_gmt: '2018-01-03 09:01:00Z',
													post_author: '20416304',
													id: 172,
													post_content: 'I must here speak by theory.',
													post_excerpt: '',
													post_title:
														'In my eyes it bore a livelier and fuller image of the spirit',
												},
											},
											'0:168': {
												from: 0,
												to: 168,
												diff: {
													post_content: [
														{
															op: 'add',
															value: 'I must here speak by theory alone.',
														},
													],
													post_title: [
														{
															op: 'add',
															value: 'In my eyes it bore a livelier image of the spirit',
														},
													],
													totals: {
														add: 18,
													},
												},
											},
											'168:169': {
												from: 168,
												to: 169,
												diff: {
													post_content: [
														{
															op: 'copy',
															value: 'I must here speak by theory alone.',
														},
													],
													post_title: [
														{
															op: 'copy',
															value: 'In my eyes it bore a livelier image of the spirit',
														},
													],
													totals: {},
												},
											},
											'169:170': {
												from: 169,
												to: 170,
												diff: {
													post_content: [
														{
															op: 'copy',
															value: 'I must here speak by theory',
														},
														{
															op: 'del',
															value: 'alone',
														},
														{
															op: 'copy',
															value: '.',
														},
													],
													post_title: [
														{
															op: 'copy',
															value: 'In my eyes it bore a livelier image of the spirit',
														},
													],
													totals: {
														del: 1,
													},
												},
											},
											'170:172': {
												from: 170,
												to: 172,
												diff: {
													post_content: [
														{
															op: 'copy',
															value: 'I must here speak by theory.',
														},
													],
													post_title: [
														{
															op: 'copy',
															value: 'In my eyes it bore a livelier ',
														},
														{
															op: 'add',
															value: 'and fuller ',
														},
														{
															op: 'copy',
															value: 'image of the spirit',
														},
													],
													totals: {
														add: 2,
													},
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
			).to.eql( [
				{
					post_date_gmt: '2018-01-03 09:01:00Z',
					post_modified_gmt: '2018-01-03 09:01:00Z',
					post_author: '20416304',
					id: 172,
					post_content: 'I must here speak by theory.',
					post_excerpt: '',
					post_title: 'In my eyes it bore a livelier and fuller image of the spirit',
				},
				{
					post_date_gmt: '2018-01-02 07:01:19Z',
					post_modified_gmt: '2018-01-02 07:01:19Z',
					post_author: '20416304',
					id: 170,
					post_content: 'I must here speak by theory.',
					post_excerpt: '',
					post_title: 'In my eyes it bore a livelier image of the spirit',
				},
				{
					post_date_gmt: '2017-12-12 18:24:37Z',
					post_modified_gmt: '2017-12-12 18:24:37Z',
					post_author: '20416304',
					id: 168,
					post_content: 'I must here speak by theory alone.',
					post_excerpt: '',
					post_title: 'In my eyes it bore a livelier image of the spirit',
				},
			] );
		}
	);
} );
