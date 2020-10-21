/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import { userState } from './fixtures/user-state';

describe( 'getSelectedOrAllSitesWithPlugins()', () => {
	test( 'should return an empty array if no sites exist in state', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
			ui: { selectedSiteId: 2916284 },
		};
		const sites = getSelectedOrAllSitesWithPlugins( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return an empty array if the sites existing are not able to contain plugins', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						visible: true,
					},
				},
			},
			ui: {},
		};
		const sites = getSelectedOrAllSitesWithPlugins( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return an array with one site if just one site exists and the user is able to manage plugins there', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916288: {
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						jetpack: true,
						visible: true,
					},
				},
			},
			ui: {},
		};
		const sites = getSelectedOrAllSitesWithPlugins( state );
		expect( sites ).to.have.length( 1 );
		expect( sites[ 0 ].ID ).to.eql( 2916288 );
	} );

	test( 'should return an array with all the sites able to have plugins', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916286: {
						manage_options: true,
					},
					2916289: {
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916286: {
						ID: 2916286,
						jetpack: true,
						visible: true,
					},
					2916287: {
						ID: 2916287,
						visible: true,
					},
					2916289: {
						ID: 2916289,
						jetpack: true,
						visible: true,
					},
				},
			},
			ui: {},
		};
		const sites = getSelectedOrAllSitesWithPlugins( state );
		expect( sites ).to.have.length( 2 );
		expect( sites[ 0 ].ID ).to.eql( 2916286 );
		expect( sites[ 1 ].ID ).to.eql( 2916289 );
	} );

	test( 'should return an array with the selected site if it is able to have plugins', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916286: {
						manage_options: true,
					},
					2916289: {
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916286: {
						ID: 2916286,
						jetpack: true,
						visible: true,
					},
					2916289: {
						ID: 2916289,
						jetpack: true,
						visible: true,
					},
				},
			},
			ui: { selectedSiteId: 2916289 },
		};
		const sites = getSelectedOrAllSitesWithPlugins( state );
		expect( sites ).to.have.length( 1 );
		expect( sites[ 0 ].ID ).to.eql( 2916289 );
	} );

	test( 'should return an empty array if the selected site is not able to have plugins', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916286: {
						manage_options: true,
					},
					2916287: {
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916286: {
						ID: 2916286,
						jetpack: true,
						visible: true,
						capabilities: {
							manage_options: true,
						},
					},
					2916287: {
						ID: 2916287,
						visible: true,
					},
				},
			},
			ui: { selectedSiteId: 2916287 },
		};
		const sites = getSelectedOrAllSitesWithPlugins( state );
		expect( sites ).to.eql( [] );
	} );
} );
