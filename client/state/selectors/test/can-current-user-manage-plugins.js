/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';

describe( 'canCurrentUserManagePlugins()', () => {
	test( 'should return false if no capabilities information exist in state', () => {
		const state = {
			currentUser: {
				capabilities: {},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.false;
	} );

	test( 'should return false if one site capability exists without referring if the user can manage it or not', () => {
		const state = {
			currentUser: {
				capabilities: {
					2916284: {
						edit_pages: true,
					},
				},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.false;
	} );

	test( 'should return false if several sites capabilities exists without referring if the user can manage it or not', () => {
		const state = {
			currentUser: {
				capabilities: {
					2916284: {
						edit_pages: true,
					},
					2916285: {
						edit_posts: false,
					},
					2916286: {},
				},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.false;
	} );

	test( 'should return false if sites capabilities explicitly tell the user can not manage', () => {
		const state = {
			currentUser: {
				capabilities: {
					2916284: {
						edit_pages: true,
						manage_options: false,
					},
					2916285: {
						edit_posts: false,
						manage_options: false,
					},
					2916286: {
						manage_options: false,
					},
				},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.false;
	} );

	test( 'should return true if just one site capability exists and the user can manage it', () => {
		const state = {
			currentUser: {
				capabilities: {
					2916284: {
						manage_options: true,
					},
				},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.true;
	} );

	test( 'should return true if many sites capabilities exist and the user can manage in all of them', () => {
		const state = {
			currentUser: {
				capabilities: {
					2916284: {
						edit_pages: true,
						manage_options: true,
					},
					2916285: {
						edit_posts: false,
						manage_options: true,
					},
					2916286: {
						manage_options: true,
					},
				},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.true;
	} );

	test( 'should return true if many sites capabilities exist and the user can manage in just one', () => {
		const state = {
			currentUser: {
				capabilities: {
					2916284: {
						edit_pages: true,
						manage_options: false,
					},
					2916285: {
						edit_posts: true,
						manage_options: true,
					},
					2916286: {
						manage_options: false,
					},
				},
			},
		};
		expect( canCurrentUserManagePlugins( state ) ).be.true;
	} );
} );
