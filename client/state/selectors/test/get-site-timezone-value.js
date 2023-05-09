import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';

describe( 'getSiteTimezoneValue()', () => {
	test( 'should return null if the site has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {},
			},
		};

		const timezone = getSiteTimezoneValue( stateTree, 2916284 );
		expect( timezone ).toBeNull();
	} );

	test( 'should return null if the site-settings has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {},
				},
			},
		};

		const timezone = getSiteTimezoneValue( stateTree, 2916284 );
		expect( timezone ).toBeNull();
	} );

	test( 'should return null if the timezone_string is an empty string', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: '',
					},
				},
			},
		};

		const timezone = getSiteTimezoneValue( stateTree, 2916284 );
		expect( timezone ).toBeNull();
	} );

	test( 'should return site-settings timezone', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: 'Europe/Skopje',
					},
				},
			},
		};

		const timezone = getSiteTimezoneValue( stateTree, 2916284 );
		expect( timezone ).toEqual( 'Europe/Skopje' );
	} );
} );
