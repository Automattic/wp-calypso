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

	test( 'should return a sorted array of revisions', () => {
		expect(
			getPostRevisions(
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
												post_content: 'This is a super cool test!\nOh rly? Ya rly',
												post_excerpt: '',
												post_title: 'Yet Another Awesome Test Post!',
											},
											169: {
												post_date_gmt: '2017-12-14 18:24:37Z',
												post_modified_gmt: '2017-12-14 18:24:37Z',
												post_author: '20416304',
												id: 169,
												post_content: 'This is a super duper cool test!\nOh rly? Ya rly',
												post_excerpt: '',
												post_title: 'Yet Another Awesome Test Post!',
											},
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
				10
			)
		).to.eql( [
			{
				post_date_gmt: '2017-12-14 18:24:37Z',
				post_modified_gmt: '2017-12-14 18:24:37Z',
				post_author: '20416304',
				id: 169,
				post_content: 'This is a super duper cool test!\nOh rly? Ya rly',
				post_excerpt: '',
				post_title: 'Yet Another Awesome Test Post!',
			},
			{
				post_date_gmt: '2017-12-12 18:24:37Z',
				post_modified_gmt: '2017-12-12 18:24:37Z',
				post_author: '20416304',
				id: 168,
				post_content: 'This is a super cool test!\nOh rly? Ya rly',
				post_excerpt: '',
				post_title: 'Yet Another Awesome Test Post!',
			},
		] );
	} );
} );
