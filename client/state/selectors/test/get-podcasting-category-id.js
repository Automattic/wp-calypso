/**
 * External dependencies
 */
import { expect } from 'chai';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';

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
