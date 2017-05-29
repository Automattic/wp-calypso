/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSites } from '../';

const currentUserState = {
	currentUser: {
		id: 12345678,
	},
	users: {
		items: {
			12345678: {
				primary_blog: 2916288,
			},
		},
	},
};

describe( 'getSites()', () => {
	it( 'should return an empty array if no sites in state', () => {
		const state = {
			...currentUserState,
			sites: {
				items: {},
			},
		};
		const sites = getSites( state );
		expect( sites ).to.eql( [] );
	} );

	it( 'should return all the sites in state', () => {
		const state = {
			...currentUserState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						visible: true,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.wordpress.com',
						options: {
							unmapped_url: 'https://example.wordpress.com',
						},
					},
					2916285: {
						ID: 2916285,
						visible: false,
						name: 'WordPress.com Way Better Example Blog',
						URL: 'https://example2.wordpress.com',
						options: {
							unmapped_url: 'https://example2.wordpress.com',
						},
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getSites( state );
		expect( sites ).to.have.length( 2 );
		expect( sites[ 0 ] ).to.have.property( 'name', 'WordPress.com Example Blog' );
		expect( sites[ 1 ] ).to.have.property( 'name', 'WordPress.com Way Better Example Blog' );
	} );

	it( 'should return the primary site as the first element of the list', () => {
		const state = {
			...currentUserState,
			sites: {
				items: {
					2916287: {
						ID: 2916287,
						name: 'WordPress.com Example Blog',
					},
					2916288: {
						ID: 2916288,
						name: 'WordPress.com Way Better Example Blog',
					},
					2916289: {
						ID: 2916289,
						name: 'WordPress.com Another Example Blog',
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getSites( state );

		expect( sites ).to.have.length( 3 );
		expect( sites[ 0 ] ).to.have.property( 'ID', 2916288 );
		expect( sites[ 1 ] ).to.have.property( 'ID', 2916287 );
		expect( sites[ 2 ] ).to.have.property( 'ID', 2916289 );
	} );
} );
