import { translate } from 'i18n-calypso';

/* eslint-disable jsdoc/require-param */
/**
 * Jetpack menu items.
 *
 * These are used for sites that are neither Simple or Atomic.
 */
/* eslint-enable jsdoc/require-param */

export default function jetpackMenu( { siteDomain, capabilities } ) {
	const menuItems = [];

	if ( capabilities?.view_stats ) {
		menuItems.push( {
			icon: 'dashicons-chart-bar',
			slug: 'stats',
			title: translate( 'Stats' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/admin.php?page=stats`,
		} );
	}

	if ( capabilities?.manage_options ) {
		menuItems.push(
			...[
				{
					icon: 'dashicons-cart',
					slug: 'upgrades',
					title: translate( 'Upgrades' ),
					type: 'menu-item',
					url: `/plans/${ siteDomain }`,
					children: [
						{
							parent: 'upgrades',
							slug: 'plans',
							title: translate( 'Plans' ),
							type: 'submenu-item',
							url: `/plans/${ siteDomain }`,
						},
						{
							parent: 'upgrades',
							slug: 'purchases',
							title: translate( 'Purchases' ),
							type: 'submenu-item',
							url: `/purchases/subscriptions/${ siteDomain }`,
						},
					],
				},
			]
		);
	}

	if ( capabilities?.edit_posts ) {
		menuItems.push( {
			icon: 'dashicons-admin-post',
			slug: 'edit-php',
			title: translate( 'Posts' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/edit.php`,
		} );
	}

	if ( capabilities?.upload_files ) {
		menuItems.push( {
			icon: 'dashicons-admin-media',
			slug: 'upload-php',
			title: translate( 'Media' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/upload.php`,
		} );
	}

	if ( capabilities?.edit_pages ) {
		menuItems.push( {
			icon: 'dashicons-admin-page',
			slug: 'edit-phppost_typepage',
			title: translate( 'Pages' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/edit.php?post_type=page`,
		} );
	}

	if ( capabilities?.edit_posts ) {
		menuItems.push( {
			icon: 'dashicons-admin-comments',
			slug: 'edit-comments-php',
			title: translate( 'Comments' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/edit-comments.php`,
		} );
	}

	if ( capabilities?.switch_themes || capabilities?.edit_theme_options ) {
		menuItems.push( {
			icon: 'dashicons-admin-appearance',
			slug: 'themes-php',
			title: translate( 'Appearance' ),
			type: 'menu-item',
			url: `/themes/${ siteDomain }`,
		} );
	}

	if ( capabilities?.activate_plugins ) {
		menuItems.push( {
			icon: 'dashicons-admin-plugins',
			slug: 'plugins',
			title: translate( 'Plugins' ),
			type: 'menu-item',
			url: `/plugins/${ siteDomain }`,
		} );
	}

	if ( capabilities?.list_users ) {
		menuItems.push( {
			icon: 'dashicons-admin-users',
			slug: 'users-php',
			title: translate( 'Users' ),
			type: 'menu-item',
			url: `/people/team/${ siteDomain }`,
			children: [
				{
					parent: 'users-php',
					slug: 'all-users',
					title: translate( 'All Users' ),
					type: 'submenu-item',
					url: `/people/team/${ siteDomain }`,
				},
				...( capabilities?.promote_users
					? [
							{
								parent: 'users-php',
								slug: 'add-new-user',
								title: translate( 'Add New User' ),
								type: 'submenu-item',
								url: `/people/new/${ siteDomain }`,
							},
					  ]
					: [] ),
				{
					parent: 'users-php',
					slug: 'subscribers',
					title: translate( 'Subscribers' ),
					type: 'submenu-item',
					url: `/subscribers/${ siteDomain }`,
				},
				{
					parent: 'users-php',
					slug: 'my-profile',
					title: translate( 'My Profile' ),
					type: 'submenu-item',
					url: '/me',
				},
				{
					parent: 'users-php',
					slug: 'account-settings',
					title: translate( 'Account Settings' ),
					type: 'submenu-item',
					url: '/me/account',
				},
			],
		} );
	} else {
		menuItems.push( {
			icon: 'dashicons-admin-users',
			slug: 'profile',
			title: translate( 'Profile' ),
			type: 'menu-item',
			url: 'me',
		} );
	}

	if ( capabilities?.manage_options ) {
		menuItems.push( {
			icon: 'dashicons-admin-tools',
			slug: 'tools-php',
			title: translate( 'Tools' ),
			type: 'menu-item',
			url: `/marketing/tools/${ siteDomain }`,
			children: [
				{
					parent: 'tools.php',
					slug: 'tools-earn',
					title: translate( 'Monetize' ),
					type: 'submenu-item',
					url: `/earn/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-import',
					title: translate( 'Import' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/import.php`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-export',
					title: translate( 'Export' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/export.php`,
				},
			],
		} );
	}

	if ( capabilities?.manage_options ) {
		menuItems.push( {
			icon: 'dashicons-admin-settings',
			slug: 'options-general-php',
			title: translate( 'Settings' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/options-general.php`,
		} );
	}

	menuItems.push( {
		icon: 'dashicons-wordpress-alt',
		slug: 'wp-admin',
		title: translate( 'WP Admin' ),
		type: 'menu-item',
		url: `https://${ siteDomain }/wp-admin`,
	} );

	return menuItems;
}
