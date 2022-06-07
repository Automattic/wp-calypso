import isHiddenSite from 'calypso/state/selectors/is-hidden-site';

describe( 'isHiddenSite()', () => {
	test( 'should return null if the site is not known', () => {
		const isHidden = isHiddenSite(
			{
				siteSettings: {
					items: {
						2916284: {
							blog_public: 1,
						},
					},
				},
			},
			2916285
		);

		expect( isHidden ).toBeNull();
	} );

	test( 'should return false for public sites', () => {
		const isHidden = isHiddenSite(
			{
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

		expect( isHidden ).toBe( false );
	} );

	test( 'should return true for hidden sites', () => {
		const isHidden = isHiddenSite(
			{
				siteSettings: {
					items: {
						2916284: {
							blog_public: 0,
						},
					},
				},
			},
			2916284
		);

		expect( isHidden ).toBe( true );
	} );
} );
