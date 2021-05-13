/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import { userState } from './fixtures/user-state';

describe( 'areAllSitesSingleUser()', () => {
	test( "should return false sites haven't been fetched yet", () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};

		const allAreSingleUser = areAllSitesSingleUser( state );
		expect( allAreSingleUser ).to.be.false;
	} );

	test( "should return false if single_user_site isn't true for all sites", () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						single_user_site: true,
					},
					2916285: {
						ID: 2916285,
						single_user_site: false,
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};

		const allAreSingleUser = areAllSitesSingleUser( state );
		expect( allAreSingleUser ).to.be.false;
	} );

	test( 'should return true if single_user_site is true for all sites', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						single_user_site: true,
					},
					2916285: {
						ID: 2916285,
						single_user_site: true,
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};

		const allAreSingleUser = areAllSitesSingleUser( state );
		expect( allAreSingleUser ).to.be.true;
	} );
} );
