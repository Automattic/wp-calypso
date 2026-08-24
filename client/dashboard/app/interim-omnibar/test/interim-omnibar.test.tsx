/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { InterimOmnibar } from '../interim-omnibar';
import type { Site, User } from '@automattic/api-core';

const userWithSite = {
	ID: 1,
	username: 'testuser',
	display_name: 'Test User',
	site_count: 1,
	primary_blog: 1,
} as User;

const userWithoutSites = {
	ID: 1,
	username: 'testuser',
	display_name: 'Test User',
	site_count: 0,
	primary_blog: 0,
} as User;

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	launch_status: 'launched',
	is_a4a_dev_site: false,
	is_wpcom_staging_site: false,
	is_wpcom_atomic: false,
	is_deleted: false,
	jetpack: false,
	site_migration: {
		migration_status: undefined,
	},
	capabilities: {
		manage_options: true,
	},
	options: {
		admin_url: 'https://test-site.wordpress.com/wp-admin/',
	},
	plan: {
		product_slug: 'free_plan',
		product_name_short: 'Free',
		is_free: true,
	},
} as Site;

describe( '<InterimOmnibar /> profile menu', () => {
	test( 'does not render a broken Edit Profile link for accounts without sites', async () => {
		render( <InterimOmnibar user={ userWithoutSites } site={ null } currentRoute="/me" /> );

		// The "My WordPress.com Account" link is the anchor that is always present;
		// wait for it so the masterbar has finished rendering the profile menu.
		expect(
			await screen.findByRole( 'link', { name: /WordPress\.com Account/i } )
		).toHaveAttribute( 'href', '/me/account' );

		// No "Edit Profile" link should exist, so there is no broken `nullprofile.php` URL.
		expect( screen.queryByRole( 'link', { name: /edit profile/i } ) ).not.toBeInTheDocument();

		// The user's identity is still shown in the menu.
		expect( screen.getAllByText( 'Test User' ).length ).toBeGreaterThan( 0 );
	} );

	test( 'renders the site Edit Profile link when a site is selected', async () => {
		render( <InterimOmnibar user={ userWithSite } site={ site } currentRoute="/me" /> );

		const editProfile = await screen.findByRole( 'link', { name: /edit profile/i } );
		expect( editProfile ).toHaveAttribute(
			'href',
			'https://test-site.wordpress.com/wp-admin/profile.php'
		);
	} );

	test( 'does not render a broken Edit Profile link when the selected site has no admin URL', async () => {
		const siteWithoutAdminUrl = { ...site, options: {} } as Site;
		render(
			<InterimOmnibar user={ userWithSite } site={ siteWithoutAdminUrl } currentRoute="/me" />
		);

		expect(
			await screen.findByRole( 'link', { name: /WordPress\.com Account/i } )
		).toHaveAttribute( 'href', '/me/account' );
		expect( screen.queryByRole( 'link', { name: /edit profile/i } ) ).not.toBeInTheDocument();
	} );
} );
