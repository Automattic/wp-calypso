/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import getPodcastingCategoryId from 'state/selectors/get-podcasting-category-id';
import getPodcastingCategory from 'state/selectors/get-podcasting-category';
import TermQueryManager from 'lib/query-manager/term';

describe( 'getPodcastingCategoryId', () => {
	test( 'returns null if settings are missing', () => {
		expect(
			getPodcastingCategoryId(
				{
					sites: {
						items: {},
					},
					siteSettings: {
						items: {},
					},
				},
				1
			)
		).to.be.null;
	} );

	test( 'returns 0 if podcasting has not been configured', () => {
		expect(
			getPodcastingCategoryId(
				{
					sites: {
						items: {},
					},
					siteSettings: {
						items: {
							1: {
								podcasting_category_id: 0,
							},
						},
					},
				},
				1
			)
		).to.equal( 0 );
	} );

	test( 'returns a category ID if podcasting has been configured', () => {
		expect(
			getPodcastingCategoryId(
				{
					sites: {
						items: {},
					},
					siteSettings: {
						items: {
							1: {
								podcasting_category_id: 123,
							},
						},
					},
				},
				1
			)
		).to.equal( 123 );
	} );

	test( 'returns null for private sites', () => {
		expect(
			getPodcastingCategoryId(
				{
					sites: {
						items: {
							1: {
								is_private: true,
							},
						},
					},
					siteSettings: {
						items: {
							1: {
								podcasting_category_id: 123,
							},
						},
					},
				},
				1
			)
		).to.be.null;
	} );
} );

describe( 'getPodcastingCategory', () => {
	test( 'returns null if podcasting has not been configured', () => {
		expect(
			getPodcastingCategory(
				{
					sites: {
						items: {},
					},
					siteSettings: {
						items: {
							1: {
								podcasting_category_id: 0,
							},
						},
					},
				},
				1
			)
		).to.be.null;
	} );

	test( 'returns a category object', () => {
		expect(
			getPodcastingCategory(
				{
					sites: {
						items: {},
					},
					siteSettings: {
						items: {
							1: {
								podcasting_category_id: 123,
							},
						},
					},
					terms: {
						queries: {
							1: {
								category: new TermQueryManager( {
									items: {
										123: {
											ID: 123,
											name: "Cain's Podcast",
											feed_url: 'https://test-site.wordpress.com/category/cains-podcast/feed/',
										},
									},
									queries: {},
								} ),
							},
						},
					},
				},
				1
			)
		).to.eql( {
			ID: 123,
			name: "Cain's Podcast",
			feed_url: 'https://test-site.wordpress.com/category/cains-podcast/feed/',
		} );
	} );
} );
