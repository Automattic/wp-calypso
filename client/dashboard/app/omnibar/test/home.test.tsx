/**
 * @jest-environment jsdom
 */
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { render, screen } from '@testing-library/react';
import type { AdminBarNode } from '@automattic/omnibar';

const WP_LOGO_NODE: AdminBarNode = {
	id: 'wp-logo',
	title:
		'<span class="ab-icon" aria-hidden="true"></span><span class="screen-reader-text">WordPress.com</span>',
	parent: false,
	href: 'https://my.wordpress.com/sites',
	group: false,
	meta: { menu_title: 'WordPress.com' },
};

const SITES_NODE: AdminBarNode = {
	id: 'wpcom-sites',
	title: 'Sites',
	parent: 'wp-logo',
	href: 'https://my.wordpress.com/sites',
	group: false,
};

describe( 'buildOmnibarNodesFromAdminBarNodes', () => {
	test( 'names the home button with the admin bar’s screen reader text', () => {
		render(
			<Omnibar nodes={ buildOmnibarNodesFromAdminBarNodes( [ WP_LOGO_NODE, SITES_NODE ] ) } />
		);

		expect( screen.getByRole( 'button', { name: 'WordPress.com' } ) ).toBeVisible();
	} );
} );
