import {
	isWpcomAdminSidebarHostLink,
	normalizeWpcomAdminSidebarHostLinks,
} from '../normalize-wpcom-admin-sidebar-host-links';

describe( 'isWpcomAdminSidebarHostLink()', () => {
	it( 'recognizes WordPress.com admin shell paths', () => {
		expect(
			isWpcomAdminSidebarHostLink( {
				slug: 'plugins',
				title: 'Plugins',
				type: 'menu-item',
				url: '/plugins/example.wordpress.com',
			} )
		).toBe( true );

		expect(
			isWpcomAdminSidebarHostLink( {
				slug: 'hosting',
				title: 'Hosting',
				type: 'menu-item',
				url: 'https://wordpress.com/overview/example.wordpress.com',
			} )
		).toBe( true );
	} );

	it( 'recognizes the legacy Upgrades item id', () => {
		expect(
			isWpcomAdminSidebarHostLink( {
				slug: 'paid-upgrades-php',
				title: 'Upgrades',
				type: 'menu-item',
				url: '/wp-admin/paid-upgrades.php',
				itemId: 'plugin:unknown:-:paid-upgrades.php',
			} )
		).toBe( true );
	} );

	it( 'does not treat WP Admin plugin management as a WordPress.com admin shell path', () => {
		expect(
			isWpcomAdminSidebarHostLink( {
				slug: 'plugins.php',
				title: 'Plugins',
				type: 'menu-item',
				url: 'https://example.wordpress.com/wp-admin/plugins.php',
			} )
		).toBe( false );
	} );
} );

describe( 'normalizeWpcomAdminSidebarHostLinks()', () => {
	it( 'keeps WordPress.com host links ungrouped and non-reassignable', () => {
		const menuItems = normalizeWpcomAdminSidebarHostLinks( [
			{
				slug: 'home',
				title: 'My Home',
				type: 'menu-item',
				url: '/home/example.wordpress.com',
				group_id: 'plugins',
				itemId: 'wpcom:home',
				reassignable: true,
			},
			{
				slug: 'jetpack',
				title: 'Jetpack',
				type: 'menu-item',
				url: '/wp-admin/admin.php?page=jetpack',
				group_id: 'plugins',
				itemId: 'plugin:jetpack',
				reassignable: true,
			},
		] );

		expect( menuItems[ 0 ] ).toMatchObject( {
			group_id: null,
			reassignable: false,
		} );
		expect( menuItems[ 1 ] ).toMatchObject( {
			group_id: 'plugins',
			reassignable: true,
		} );
	} );
} );
