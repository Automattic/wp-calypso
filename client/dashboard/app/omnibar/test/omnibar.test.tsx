/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { dashboardLink } from '../../../utils/link';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { shoppingCartManagerClient } from '../../shopping-cart';
import OmnibarContainer from '../omnibar';
import type { AppConfig } from '../../context';

const site = {
	ID: 1,
	name: 'Test Site',
	site_migration: {},
	options: {
		admin_url: 'https://test-site.wordpress.com/wp-admin/',
		wpcom_admin_interface: 'wp-admin',
	},
};

const config: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		reader: true,
		help: true,
		notifications: true,
		commandPalette: true,
	},
};

const dashboardAdminBarNodes = [
	{
		id: 'user-actions',
		title: false,
		parent: 'my-account',
		href: false,
		group: true,
	},
	{
		id: 'user-info',
		title:
			"<img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-64' /><span class='display-name'>Test User</span><span class='username'>testuser</span><span class='display-name edit-profile'>Edit Profile</span>",
		parent: 'user-actions',
		href: 'https://my.wordpress.com/me/account',
		group: false,
	},
	{
		id: 'logout',
		title: 'Log Out',
		parent: 'user-actions',
		href: 'https://public-api.wordpress.com/wp-login.php?action=logout&amp;_wpnonce=0123456789',
		group: false,
	},
	{
		id: 'wpcom-account',
		title: false,
		parent: 'my-account',
		href: false,
		group: true,
		meta: {
			class: 'ab-sub-secondary',
		},
	},
	{
		id: 'my-wpcom-account',
		title:
			'<span class="button wpcom-button">My <span class="wpcom-logo"></span> WordPress.com Account</span>',
		parent: 'wpcom-account',
		href: 'https://my.wordpress.com/me/account',
		group: false,
	},
	{
		id: 'wp-logo',
		title:
			'<span class="ab-icon" aria-hidden="true"></span><span class="screen-reader-text">WordPress.com</span>',
		parent: false,
		href: 'https://my.wordpress.com/sites',
		group: false,
		meta: {
			menu_title: 'WordPress.com',
		},
	},
	{
		id: 'wpcom-sites',
		title: 'Sites',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/sites',
		group: false,
	},
	{
		id: 'wpcom-domains',
		title: 'Domains',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/domains',
		group: false,
	},
	{
		id: 'wpcom-emails',
		title: 'Emails',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/emails',
		group: false,
	},
	{
		id: 'wpcom-plugins',
		title: 'Plugins',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/plugins',
		group: false,
	},
	{
		id: 'reader',
		title:
			'<span class="ab-icon" title="Read the blogs and topics you follow" aria-hidden="true"></span><span class="ab-label">Reader</span>',
		parent: 'top-secondary',
		href: 'https://wordpress.com/reader',
		group: false,
	},
	{
		id: 'help-center',
		title:
			'<span title="Help Center"><svg id="help-center-icon" class="ab-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z" /></svg><svg id="help-center-icon-with-notification" class="ab-icon" width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM13 18H11V16H13V18ZM13 13.859V15H11V13C11 12.448 11.448 12 12 12C13.103 12 14 11.103 14 10C14 8.897 13.103 8 12 8C10.897 8 10 8.897 10 10H8C8 7.791 9.791 6 12 6C14.209 6 16 7.791 16 10C16 11.862 14.722 13.413 13 13.859Z" fill="currentColor"/><circle cx="20" cy="3.5" r="4.3" fill="#e65054" stroke="#1d2327" stroke-width="2"/></svg></span>',
		parent: 'top-secondary',
		href: 'https://wordpress.com/help?help-center=home',
		group: false,
		meta: {
			menu_title: '',
			icon: 'help',
		},
	},
	{
		id: 'notes',
		title:
			'<span title="Manage your notifications"><span id="wpnt-notes-unread-count" class="wpnt-loading wpn-read"></span><span class="noticon noticon-bell ab-icon"></span></span>',
		parent: 'top-secondary',
		href: 'https://wordpress.com/reader/notifications',
		group: false,
	},
	{
		id: 'wp-logo-external',
		title: false,
		parent: 'wp-logo',
		href: false,
		group: true,
		meta: {
			class: 'ab-sub-secondary',
		},
	},
	{
		id: 'my-account',
		title:
			"Howdy, <span class=\"display-name\">Test User</span><img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-28' />",
		parent: 'top-secondary',
		href: 'https://my.wordpress.com/me/account',
		group: false,
		meta: {
			menu_title: 'Howdy, Test User',
		},
	},
];

const siteAdminBarNodes = [
	{
		id: 'user-actions',
		title: false,
		parent: 'my-account',
		href: false,
		group: true,
	},
	{
		id: 'user-info',
		title:
			"<img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-64' /><span class='display-name'>Test User</span><span class='username'>testuser</span><span class='display-name edit-profile'>Edit Profile</span>",
		parent: 'user-actions',
		href: 'https://test-site.wordpress.com/wp-admin/profile.php',
		group: false,
	},
	{
		id: 'logout',
		title: 'Log Out',
		parent: 'user-actions',
		href: 'https://test-site.wordpress.com/wp-login.php?action=logout&amp;_wpnonce=0123456789',
		group: false,
	},
	{
		id: 'wpcom-account',
		title: false,
		parent: 'my-account',
		href: false,
		group: true,
		meta: {
			class: 'ab-sub-secondary',
		},
	},
	{
		id: 'my-wpcom-account',
		title:
			'<span class="button wpcom-button">My <span class="wpcom-logo"></span> WordPress.com Account</span>',
		parent: 'wpcom-account',
		href: 'https://my.wordpress.com/me/account',
		group: false,
	},
	{
		id: 'wp-logo',
		title:
			'<span class="ab-icon" aria-hidden="true"></span><span class="screen-reader-text">WordPress.com</span>',
		parent: false,
		href: 'https://my.wordpress.com/sites',
		group: false,
		meta: {
			menu_title: 'WordPress.com',
		},
	},
	{
		id: 'wpcom-sites',
		title: 'Sites',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/sites',
		group: false,
	},
	{
		id: 'wpcom-domains',
		title: 'Domains',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/domains',
		group: false,
	},
	{
		id: 'wpcom-emails',
		title: 'Emails',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/emails',
		group: false,
	},
	{
		id: 'wpcom-plugins',
		title: 'Plugins',
		parent: 'wp-logo',
		href: 'https://my.wordpress.com/plugins',
		group: false,
	},
	{
		id: 'reader',
		title:
			'<span class="ab-icon" title="Read the blogs and topics you follow" aria-hidden="true"></span><span class="ab-label">Reader</span>',
		parent: 'top-secondary',
		href: 'https://wordpress.com/reader',
		group: false,
	},
	{
		id: 'help-center',
		title:
			'<span title="Help Center"><svg id="help-center-icon" class="ab-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z" /></svg><svg id="help-center-icon-with-notification" class="ab-icon" width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM13 18H11V16H13V18ZM13 13.859V15H11V13C11 12.448 11.448 12 12 12C13.103 12 14 11.103 14 10C14 8.897 13.103 8 12 8C10.897 8 10 8.897 10 10H8C8 7.791 9.791 6 12 6C14.209 6 16 7.791 16 10C16 11.862 14.722 13.413 13 13.859Z" fill="currentColor"/><circle cx="20" cy="3.5" r="4.3" fill="#e65054" stroke="#1d2327" stroke-width="2"/></svg></span>',
		parent: 'top-secondary',
		href: 'https://wordpress.com/help?help-center=home',
		group: false,
		meta: {
			menu_title: '',
			icon: 'help',
		},
	},
	{
		id: 'site-name',
		title:
			'<img class="site-icon" src="https://test-site.wordpress.com/wp-content/uploads/2026/02/cropped-site-icon.jpg?w=32" srcset="https://test-site.wordpress.com/wp-content/uploads/2026/02/cropped-site-icon.jpg?w=64 2x" alt="" width="20" height="20" />Test Site',
		parent: false,
		href: 'https://test-site.wordpress.com/',
		group: false,
		meta: {
			menu_title: 'Test Site',
		},
	},
	{
		id: 'view-site',
		title: 'Visit Site',
		parent: 'site-name',
		href: 'https://test-site.wordpress.com/',
		group: false,
	},
	{
		id: 'site-plan',
		title: false,
		parent: 'site-name',
		href: false,
		group: true,
	},
	{
		id: 'site-plan-badge',
		title:
			'<a class="wp-admin-bar__site-info" href="https://wordpress.com/plans/test-site.wordpress.com">\n\t\t\t\t\t\t\t\t<span class="wp-admin-bar__site-info-label">Plan</span>\n\t\t\t\t\t\t\t\t<span class="wp-admin-bar__info-badges">Free</span>\n\t\t\t\t\t\t\t</a>',
		parent: 'site-plan',
		href: false,
		group: false,
	},
	{
		id: 'site-status',
		title: false,
		parent: 'site-name',
		href: false,
		group: true,
		meta: {
			class: 'ab-sub-secondary',
		},
	},
	{
		id: 'site-status-badge',
		title:
			'<div class="wp-admin-bar__site-info">\n\t\t\t\t\t\t\t<span class="wp-admin-bar__site-info-label">Status</span>\n\t\t\t\t\t\t\t<span class="wp-admin-bar__info-badges">Coming Soon</span>\n\t\t\t\t\t\t</div>',
		parent: 'site-status',
		href: false,
		group: false,
	},
	{
		id: 'wpcom-stats',
		title: 'Stats',
		parent: 'site-name',
		href: 'https://test-site.wordpress.com/wp-admin/admin.php?page=stats',
		group: false,
	},
	{
		id: 'updates',
		title:
			'<span class="ab-icon" aria-hidden="true"></span><span class="ab-label" aria-hidden="true">1</span><span class="screen-reader-text updates-available-text">1 update available</span>',
		parent: false,
		href: 'https://test-site.wordpress.com/wp-admin/update-core.php',
		group: false,
	},
	{
		id: 'command-palette',
		title:
			'<span class="ab-icon" aria-hidden="true"></span><span class="ab-label"><kbd>⌘K</kbd><span class="screen-reader-text"> Open command palette</span></span>',
		parent: false,
		href: '#',
		group: false,
	},
	{
		id: 'comments',
		title:
			'<span class="ab-icon" aria-hidden="true"></span><span class="ab-label awaiting-mod pending-count count-0" aria-hidden="true">0</span><span class="screen-reader-text comments-in-moderation-text">0 Comments in moderation</span>',
		parent: false,
		href: 'https://test-site.wordpress.com/wp-admin/edit-comments.php',
		group: false,
	},
	{
		id: 'new-content',
		title: '<span class="ab-icon" aria-hidden="true"></span><span class="ab-label">New</span>',
		parent: false,
		href: '/wp-admin/post-new.php?post_type=post',
		group: false,
		meta: {
			menu_title: 'New',
		},
	},
	{
		id: 'new-post',
		title: 'Post',
		parent: 'new-content',
		href: '/wp-admin/post-new.php?post_type=post',
		group: false,
	},
	{
		id: 'new-media',
		title: 'Media',
		parent: 'new-content',
		href: 'https://test-site.wordpress.com/wp-admin/media-new.php',
		group: false,
	},
	{
		id: 'new-page',
		title: 'Page',
		parent: 'new-content',
		href: 'https://test-site.wordpress.com/wp-admin/post-new.php?post_type=page',
		group: false,
	},
	{
		id: 'new-user',
		title: 'User',
		parent: 'new-content',
		href: 'https://wordpress.com/people/new/test-site.wordpress.com',
		group: false,
	},
	{
		id: 'notes',
		title:
			'<span title="Manage your notifications"><span id="wpnt-notes-unread-count" class="wpnt-loading wpn-read"></span><span class="noticon noticon-bell ab-icon"></span></span>',
		parent: 'top-secondary',
		href: 'https://wordpress.com/reader/notifications',
		group: false,
	},
	{
		id: 'wp-logo-external',
		title: false,
		parent: 'wp-logo',
		href: false,
		group: true,
		meta: {
			class: 'ab-sub-secondary',
		},
	},
	{
		id: 'my-account',
		title:
			"Howdy, <span class=\"display-name\">Test User</span><img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-28' />",
		parent: 'top-secondary',
		href: 'https://test-site.wordpress.com/wp-admin/profile.php',
		group: false,
		meta: {
			menu_title: 'Howdy, Test User',
		},
	},
];

function mockAdminBar( path: string, nodes: unknown[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2${ path }` )
		.query( true )
		.reply( 200, { nodes } );
}

function renderOmnibar( { siteId = null }: { siteId?: number | null } = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, siteId );

	return render(
		<OmnibarContainer cartManagerClient={ shoppingCartManagerClient } preferDashboardAdminBar />,
		{ config, queryClient }
	);
}

function expectInOrder( elements: HTMLElement[] ) {
	elements.reduce( ( previous, element ) => {
		expect(
			previous.compareDocumentPosition( element ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		return element;
	} );
}

describe( '<Omnibar>', () => {
	afterEach( () => nock.cleanAll() );

	test( 'renders the dashboard admin bar on global pages', async () => {
		const user = userEvent.setup();
		mockAdminBar( '/dashboard/admin-bar', dashboardAdminBarNodes );

		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );

		expectInOrder( [
			within( toolbar ).getByRole( 'button', { name: 'Menu' } ),
			await within( toolbar ).findByRole( 'button', { name: 'WordPress.com' } ),
			within( toolbar ).getByRole( 'button', { name: 'Reader' } ),
			within( toolbar ).getByRole( 'button', { name: 'Help Center' } ),
			within( toolbar ).getByRole( 'button', { name: 'Manage your notifications' } ),
			within( toolbar ).getByRole( 'button', { name: 'Howdy, Test User' } ),
		] );
		expect(
			within( toolbar ).queryByRole( 'button', { name: 'Test Site' } )
		).not.toBeInTheDocument();

		await user.hover( within( toolbar ).getByRole( 'button', { name: 'Howdy, Test User' } ) );

		expect(
			await screen.findByRole( 'menuitem', { name: /WordPress.com Account/ } )
		).toHaveAttribute( 'href', dashboardLink( '/me/account' ) );
	} );

	test( 'renders the site admin bar on site pages', async () => {
		const user = userEvent.setup();
		mockAdminBar( '/dashboard/admin-bar', dashboardAdminBarNodes );
		mockAdminBar( `/sites/${ site.ID }/admin-bar`, siteAdminBarNodes );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }` )
			.query( true )
			.reply( 200, site );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/me/shopping-cart/${ site.ID }` )
			.reply( 200, {
				...getEmptyResponseCart(),
				blog_id: site.ID,
				cart_key: site.ID,
				products: [
					{
						...getEmptyResponseCartProduct(),
						product_name: 'WordPress.com Personal',
						product_slug: 'personal-bundle',
					},
				],
			} );

		renderOmnibar( { siteId: site.ID } );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const siteNode = await within( toolbar ).findByRole( 'button', { name: 'Test Site' } );

		expectInOrder( [
			await within( toolbar ).findByRole( 'button', { name: 'WordPress.com' } ),
			siteNode,
			await within( toolbar ).findByRole( 'button', { name: '1 update available' } ),
			within( toolbar ).getByRole( 'button', { name: 'Open command palette' } ),
			within( toolbar ).getByRole( 'button', { name: '0 Comments in moderation' } ),
			within( toolbar ).getByRole( 'button', { name: 'New' } ),
			await within( toolbar ).findByRole( 'button', { name: 'My shopping cart' } ),
			within( toolbar ).getByRole( 'button', { name: 'Reader' } ),
			within( toolbar ).getByRole( 'button', { name: 'Help Center' } ),
			within( toolbar ).getByRole( 'button', { name: 'Manage your notifications' } ),
			within( toolbar ).getByRole( 'button', { name: 'Howdy, Test User' } ),
		] );
		expect( within( toolbar ).getByRole( 'button', { name: 'New' } ) ).toHaveAttribute(
			'href',
			'https://test-site.wordpress.com/wp-admin/post-new.php?post_type=post'
		);

		await user.hover( siteNode );

		expectInOrder( [
			await screen.findByRole( 'menuitem', { name: 'Visit Site' } ),
			screen.getByRole( 'menuitem', { name: 'Dashboard' } ),
			screen.getByRole( 'menuitem', { name: 'Stats' } ),
			screen.getByText( 'Free' ),
			screen.getByText( 'Coming Soon' ),
		] );

		await user.keyboard( '{Escape}' );
		await user.hover( within( toolbar ).getByRole( 'button', { name: 'Howdy, Test User' } ) );

		expect( await screen.findByRole( 'menuitem', { name: /Edit Profile/ } ) ).toHaveAttribute(
			'href',
			dashboardLink( '/me/account' )
		);
	} );
} );
