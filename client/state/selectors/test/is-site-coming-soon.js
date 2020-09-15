/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import isSiteComingSoon from 'state/selectors/is-site-coming-soon';

describe( 'isSiteComingSoon()', () => {
	test( 'should return false if neither the site nor settings are known', () => {
		const isComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
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
		const isComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
							is_coming_soon: true, // Prefer
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_public_coming_soon: 1, // Ignore
						},
					},
				},
			},
			2916284
		);
		const isAlsoComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
							is_coming_soon: true, // Prefer
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_public_coming_soon: 0, // Ignore
						},
					},
				},
			},
			2916284
		);

		const isNotComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
							is_coming_soon: false, // Prefer
							is_private: true,
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_public_coming_soon: 1, // Ignore
						},
					},
				},
			},
			2916284
		);

		expect( isComingSoon && isAlsoComingSoon && ! isNotComingSoon ).toBe( true );
	} );

	test( 'should always return false for private sites', () => {
		const isComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
							is_coming_soon: true,
							is_private: true,
						},
					},
				},
				siteSettings: {},
			},
			2916284
		);

		expect( isComingSoon ).toBe( false );
	} );

	test( 'should fallback to settings state', () => {
		const isComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_public_coming_soon: 1,
							blog_public: 1,
						},
					},
				},
			},
			2916284
		);
		const isNotComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {},
				},
				siteSettings: {
					items: {
						2916284: {
							wpcom_public_coming_soon: 1,
							blog_public: -1,
						},
					},
				},
			},
			2916284
		);
		expect( isComingSoon && ! isNotComingSoon ).toBe( true );
	} );

	test( 'should return false for public sites', () => {
		const isComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
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
		const isComingSoon = isSiteComingSoon(
			{
				sites: {
					items: {
						2916284: {
							is_private: false,
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
