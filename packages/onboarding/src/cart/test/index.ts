import { Visibility } from '@automattic/data-stores';
import { getNewSiteParams } from '..';
import { HOSTING_LP_FLOW, IMPORT_FOCUSED_FLOW } from '../../utils/flows';

describe( 'getNewSiteParams', () => {
	function testParams( partialParams: Partial< Parameters< typeof getNewSiteParams >[ 0 ] > = {} ) {
		return {
			flowToCheck: 'test-flow',
			isPurchasingDomainItem: false,
			themeSlugWithRepo: 'pub/test-theme',
			siteTitle: 'test site title',
			siteAccentColor: '#deface',
			useThemeHeadstart: false,
			siteVisibility: Visibility.Private,
			username: 'testuser',
			...partialParams,
		} satisfies Parameters< typeof getNewSiteParams >[ 0 ];
	}

	test( 'siteVisibility set to publicly indexed', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.PublicIndexed,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.PublicIndexed,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 0,
				} ),
			} )
		);
	} );

	test( 'siteVisibility set to public but not indexed', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.PublicNotIndexed,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.PublicNotIndexed,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 1,
				} ),
			} )
		);
	} );

	test( 'siteVisibility set to private', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteVisibility: Visibility.Private,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				public: Visibility.Private,
				options: expect.objectContaining( {
					wpcom_public_coming_soon: 0, // Private sites are not "private" from all traffic
				} ),
			} )
		);
	} );

	test( 'blog_name hint uses the site title when no site URL is present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: undefined,
					siteTitle: 'Testing Inc.',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'Testing Inc.',
				find_available_url: true,
			} )
		);
	} );

	test( 'blog_name hint falls back to the username when no site URL or title is present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					flowToCheck: HOSTING_LP_FLOW,
					siteUrl: undefined,
					siteTitle: '',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: '',
				find_available_url: true,
			} )
		);
	} );

	test( 'Hosting flow does not fall back to username when site title and URL are missing', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: undefined,
					siteTitle: '',
					username: 'janedoe',
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'janedoe',
				find_available_url: true,
			} )
		);
	} );

	test( 'blog_name hint uses the site URL when present', () => {
		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'testing123.wordpress.com',
					siteTitle: 'Testing Inc.',
					username: 'janedoe',
					isPurchasingDomainItem: true,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'testing123',
				find_available_url: true,
			} )
		);

		expect(
			getNewSiteParams(
				testParams( {
					siteUrl: 'testing123.wordpress.com',
					siteTitle: 'Testing Inc.',
					username: 'janedoe',
					isPurchasingDomainItem: false,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'testing123',
				find_available_url: false,
			} )
		);
	} );

	test( 'Migration flow uses find_available_url', () => {
		expect(
			getNewSiteParams(
				testParams( {
					flowToCheck: IMPORT_FOCUSED_FLOW,
					siteUrl: 'testing123.wordpress.com',
					isPurchasingDomainItem: false,
				} )
			)
		).toEqual(
			expect.objectContaining( {
				blog_name: 'testing123',
				find_available_url: true, // True despite the fact isPurchasingDomainItem is false
			} )
		);
	} );
} );
