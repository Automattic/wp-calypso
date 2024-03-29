import getSites from 'calypso/state/selectors/get-sites';

const currentUser = {
	id: 12345678,
	user: {
		primary_blog: 2916288,
	},
	capabilities: {},
};

describe( 'getSites()', () => {
	test( 'should return an empty array if no sites in state', () => {
		const state = {
			currentUser,
			sites: {
				items: {},
			},
		};
		const sites = getSites( state );
		expect( sites ).toEqual( [] );
	} );

	test( 'should return the primary site if the user has only one site', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					2916288: { ID: 2916288, name: 'WordPress.com Example Blog' },
				},
			},
		};

		const sites = getSites( state );
		expect( sites ).toHaveLength( 1 );
	} );

	test( 'should return the sites lists if the user has no primary site', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					2916287: { ID: 2916287, name: 'WordPress.com Example Blog' },
					2916286: { ID: 2916286, name: 'WordPress.com Example Blog' },
				},
			},
		};

		const sites = getSites( state );
		expect( sites ).toHaveLength( 2 );
	} );

	test( 'should return all the sites in state', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
					2916285: { ID: 2916285, name: 'WordPress.com Way Better Example Blog' },
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getSites( state );
		expect( sites ).toHaveLength( 2 );
		expect( sites[ 0 ] ).toHaveProperty( 'name', 'WordPress.com Example Blog' );
		expect( sites[ 1 ] ).toHaveProperty( 'name', 'WordPress.com Way Better Example Blog' );
	} );

	test( 'should return the primary site as the first element of the list', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					2916287: { ID: 2916287, name: 'WordPress.com Example Blog' },
					2916288: { ID: 2916288, name: 'WordPress.com Way Better Example Blog' },
					2916289: { ID: 2916289, name: 'WordPress.com Another Example Blog' },
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getSites( state );

		expect( sites ).toHaveLength( 3 );
		expect( sites[ 0 ] ).toHaveProperty( 'ID', 2916288 );
	} );

	test( 'should return sites in alphabetical order by name and url', () => {
		const state = {
			currentUser,
			sites: {
				items: {
					2916287: { ID: 2916287, name: 'WordPress.com B Site', URL: '' },
					2916288: { ID: 2916288, name: 'WordPress.com Z Site', URL: '' },
					2916289: { ID: 2916289, name: 'WordPress.com A Site', URL: '' },
					2916290: { ID: 2916290, name: 'WordPress.com C Site', URL: '' },
					2916291: { ID: 2916291, name: 'WordPress.com 0 Site', URL: '' },
					2916292: { ID: 2916292, name: '', URL: 'https://z-site-with-no-name.wordpress.com' },
					2916293: { ID: 2916293, name: '', URL: 'https://0-site-with-no-name.wordpress.com' },
					2916294: {
						ID: 2916294,
						name: 'WordPress.com B Site',
						URL: 'https://site-with-same-name-2.wordpress.com',
					},
					2916295: {
						ID: 2916295,
						name: 'WordPress.com B Site',
						URL: 'https://site-with-same-name-1.wordpress.com',
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getSites( state );

		expect( sites ).toHaveLength( 9 );
		expect( sites[ 0 ] ).toHaveProperty( 'ID', 2916288 ); // WordPress.com Z Blog - Primary Site
		expect( sites[ 1 ] ).toHaveProperty( 'ID', 2916293 ); // https://0-site-with-no-name.wordpress.com
		expect( sites[ 2 ] ).toHaveProperty( 'ID', 2916292 ); // https://z-site-with-no-name.wordpress.com
		expect( sites[ 3 ] ).toHaveProperty( 'ID', 2916291 ); // WordPress.com 0 Site
		expect( sites[ 4 ] ).toHaveProperty( 'ID', 2916289 ); // WordPress.com A Site
		expect( sites[ 5 ] ).toHaveProperty( 'ID', 2916287 ); // WordPress.com B Site
		expect( sites[ 6 ] ).toHaveProperty( 'ID', 2916295 ); // WordPress.com B Site - https://site-with-same-name-1.wordpress.com
		expect( sites[ 7 ] ).toHaveProperty( 'ID', 2916294 ); // WordPress.com B Site - https://site-with-same-name-2.wordpress.com
		expect( sites[ 8 ] ).toHaveProperty( 'ID', 2916290 ); // WordPress.com C Site
	} );
} );
