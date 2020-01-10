/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import isComingSoonSite from 'state/selectors/is-coming-soon-site';

describe( 'isComingSoonSite()', () => {
	test( 'should return false if neither the site nor settings are known', () => {
		const isComingSoon = isComingSoonSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_coming_soon: false,
						},
					},
				},
				siteSettings: {
					items: {},
				},
			},
			2916285
		);

		expect( isComingSoon ).toBe( false );
	} );

	test( 'should prefer site state', () => {
		const isComingSoon = isComingSoonSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_coming_soon: true,
							is_private: true,
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_coming_soon: 1,
						},
					},
				},
			},
			2916284
		);

		expect( isComingSoon ).toBe( true );
	} );

	test( 'should always return false for non-private sites', () => {
		const isComingSoon = isComingSoonSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_coming_soon: true,
							is_private: false,
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_coming_soon: 1,
						},
					},
				},
			},
			2916284
		);

		expect( isComingSoon ).toBe( false );
	} );

	test( 'should fall back to settings state', () => {
		const isComingSoon = isComingSoonSite(
			{
				sites: {
					items: {},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_coming_soon: 1,
							blog_public: -1,
						},
					},
				},
			},
			2916284
		);

		expect( isComingSoon ).toBe( true );
	} );

	test( 'should return false for public sites', () => {
		const isComingSoon = isComingSoonSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_coming_soon: false,
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							blog_public: 1,
						},
					},
				},
			},
			2916284
		);

		expect( isComingSoon ).toBe( false );
	} );

	test( 'should return true for coming soon sites', () => {
		const isComingSoon = isComingSoonSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_private: true,
							is_coming_soon: true,
						},
					},
				},
				siteSettings: {
					items: {},
				},
			},
			2916284
		);

		expect( isComingSoon ).toBe( true );
	} );
} );
