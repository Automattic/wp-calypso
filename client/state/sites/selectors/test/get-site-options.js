import { getSiteOptions } from 'calypso/state/sites/selectors';

const userState = {
	currentUser: {
		id: 12345678,
		capabilities: {},
	},
	users: {
		items: {
			12345678: {
				primary_blog: 2916288,
			},
		},
	},
};

describe( 'getSiteOptions()', () => {
	test( 'should return null if site is not found', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};
		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).toBeNull();
	} );

	test( 'should return default options object if no options are found', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: { ID: 2916288, name: 'WordPress.com Example Blog' },
				},
			},
		};

		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).toEqual( {} );
	} );

	test( 'should return the options of the site if they exist', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Example Blog',
						options: {
							option2: 'not-ok',
							default_post_format: 'test',
						},
					},
				},
			},
		};

		const siteOptions = getSiteOptions( state, 2916288 );
		expect( siteOptions ).toEqual( {
			default_post_format: 'test',
			option2: 'not-ok',
		} );
	} );
} );
