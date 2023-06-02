import isPrivateSite from 'calypso/state/selectors/is-private-site';

describe( 'isPrivateSite()', () => {
	test( 'should return null if neither the site nor settings are known', () => {
		const isPrivate = isPrivateSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_private: false,
						},
					},
				},
				siteSettings: {
					items: {},
				},
			},
			2916285
		);

		expect( isPrivate ).toBeNull();
	} );

	test( 'should prefer site state', () => {
		const isPrivate = isPrivateSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_private: true,
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

		expect( isPrivate ).toBe( true );
	} );

	test( 'should fall back to settings state', () => {
		const isPrivate = isPrivateSite(
			{
				sites: {
					items: {},
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

		expect( isPrivate ).toBe( false );
	} );

	test( 'should return false for public sites', () => {
		const isPrivate = isPrivateSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_private: false,
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

		expect( isPrivate ).toBe( false );
	} );

	test( 'should return true for private sites', () => {
		const isPrivate = isPrivateSite(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							is_private: true,
						},
					},
				},
				siteSettings: {
					items: {
						2916284: {
							blog_public: -1,
						},
					},
				},
			},
			2916284
		);

		expect( isPrivate ).toBe( true );
	} );
} );
