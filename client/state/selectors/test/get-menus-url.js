/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMenusUrl from 'calypso/state/selectors/get-menus-url';

const state = {
	currentUser: {
		id: 12345678,
		capabilities: {
			6543210: {
				edit_theme_options: false,
			},
			7654321: {
				edit_theme_options: true,
			},
			8765432: {
				edit_theme_options: true,
			},
			9876543: {
				edit_theme_options: true,
			},
		},
	},
	sites: {
		items: {
			7654321: {
				jetpack: true,
				options: {
					admin_url: 'https://example.com/wp-admin/',
				},
			},
			8765432: {
				jetpack: false,
				URL: 'https://example.wordpress.com',
			},
			9876543: {
				jetpack: false,
				URL: 'https://example2.wordpress.com',
			},
		},
	},
};

describe( 'getMenusUrl()', () => {
	test( 'should return null if no siteId is given', () => {
		const url = getMenusUrl( state );
		expect( url ).to.be.null;
	} );

	test( "should return null if the current user can't edit_theme_options", () => {
		const url = getMenusUrl( state, 6543210 );
		expect( url ).to.be.null;
	} );

	test( "should return URL of the Jetpack site's customizer menu panel for a Jetpack site", () => {
		const url = getMenusUrl( state, 7654321 );
		expect( url ).to.equal(
			'https://example.com/wp-admin/customize.php?autofocus[panel]=nav_menus'
		);
	} );

	test( 'should return URL of the Calypso customizer (top-level) for a user with unverified email', () => {
		const userState = {
			users: {
				items: {
					12345678: {
						email_verified: false,
					},
				},
			},
		};

		const url = getMenusUrl( { ...state, ...userState }, 8765432 );
		expect( url ).to.equal( '/customize/example.wordpress.com' );
	} );

	test( "should return URL of the Calypso customizer's menu panel for a WP.com site", () => {
		const userState = {
			users: {
				items: {
					12345678: {
						email_verified: true,
					},
				},
			},
		};

		const url = getMenusUrl( { ...state, ...userState }, 9876543 );
		expect( url ).to.equal( '/customize/menus/example2.wordpress.com' );
	} );
} );
