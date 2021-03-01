/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getNewestSite from 'calypso/state/selectors/get-newest-site';

const site = { ID: 2916288, name: 'WordPress.com Example Blog' };
const currentUserState = {
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

describe( 'getNewestSite()', () => {
	test( 'should return null if no sites in state', () => {
		const state = {
			...currentUserState,
			sites: {
				items: {},
			},
		};

		const newestSite = getNewestSite( state );
		expect( newestSite ).to.be.null;
	} );

	test( 'should return the single site if the user has only one site', () => {
		const state = {
			...currentUserState,
			sites: {
				items: {
					2916288: site,
				},
			},
		};

		const newestSite = getNewestSite( state );
		expect( newestSite ).to.have.property( 'ID', 2916288 );
	} );

	test( 'should return the site with the largest ID if user has multiple sites', () => {
		const state = {
			...currentUserState,
			sites: {
				items: {
					1234567: { ...site, ID: 1234567 },
					2916288: site,
					123458: { ...site, ID: 123458 },
				},
			},
		};

		const newestSite = getNewestSite( state );
		expect( newestSite ).to.have.property( 'ID', 2916288 );
	} );
} );
