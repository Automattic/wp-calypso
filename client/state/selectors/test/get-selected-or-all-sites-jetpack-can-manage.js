/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import { userState } from './fixtures/user-state';

describe( 'getSelectedOrAllSitesJetpackCanManage()', () => {
	test( 'should return an empty array if no sites exist in state', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
			ui: { selectedSiteId: 2916284 },
		};
		const sites = getSelectedOrAllSitesJetpackCanManage( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return an empty array if the sites existing do not verify jetpack management conditions', () => {
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
		const sites = getSelectedOrAllSitesJetpackCanManage( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return an array with one site if just one site exists and verifies jetpack management conditions', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916288: {
						edit_pages: true,
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916288: {
						ID: 2916288,
						jetpack: true,
					},
				},
			},
			ui: {},
		};
		const sites = getSelectedOrAllSitesJetpackCanManage( state );
		expect( sites ).to.have.length( 1 );
		expect( sites[ 0 ].ID ).to.eql( 2916288 );
	} );

	test( 'should return an array with all the sites that verify jetpack management conditions', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916286: {
						edit_pages: true,
						manage_options: true,
					},
					2916289: {
						edit_pages: true,
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916286: {
						ID: 2916286,
						jetpack: true,
					},
					2916287: {
						ID: 2916287,
					},
					2916289: {
						ID: 2916289,
						jetpack: true,
					},
				},
			},
			ui: {},
		};
		const sites = getSelectedOrAllSitesJetpackCanManage( state );
		expect( sites ).to.have.length( 2 );
		expect( sites[ 0 ].ID ).to.eql( 2916286 );
		expect( sites[ 1 ].ID ).to.eql( 2916289 );
	} );

	test( 'should return an array with the selected site if it verifies jetpack management conditions', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916289: {
						edit_pages: true,
						manage_options: true,
					},
				},
			},
			sites: {
				items: {
					2916289: {
						ID: 2916289,
						jetpack: true,
					},
				},
			},
			ui: { selectedSiteId: 2916289 },
		};
		const sites = getSelectedOrAllSitesJetpackCanManage( state );
		expect( sites ).to.have.length( 1 );
		expect( sites[ 0 ].ID ).to.eql( 2916289 );
	} );

	test( 'should return an empty array if the selected site can not be managed', () => {
		const state = {
			users: userState.users,
			currentUser: {
				id: 12345678,
				capabilities: {
					2916287: {
						manage_options: false,
					},
				},
			},
			sites: {
				items: {
					2916287: {
						ID: 2916287,
						jetpack: true,
					},
				},
			},
			ui: { selectedSiteId: 2916287 },
		};
		const sites = getSelectedOrAllSitesJetpackCanManage( state );
		expect( sites ).to.eql( [] );
	} );
} );
