import getSiteSetting from 'calypso/state/selectors/get-site-setting';

describe( 'getSiteSettings()', () => {
	const state = {
		siteSettings: {
			items: {
				2916284: { default_category: 'chicken' },
			},
		},
	};

	test( 'should return null if the site is not tracked', () => {
		const settings = getSiteSetting( state, 2916285 );

		expect( settings ).toBeNull();
	} );

	test( 'should return the setting for a siteId', () => {
		const settings = getSiteSetting( state, 2916284, 'default_category' );

		expect( settings ).toEqual( 'chicken' );
	} );
} );
