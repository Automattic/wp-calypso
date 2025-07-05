import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
/* eslint-disable jsdoc/require-param */
/**
 * Fallback nav menu items.
 *
 * These are used as a fallback to ensure that if the API response for menu items
 * fails, the user always sees some menu items. They are required only in the
 * following circumstances:
 *
 * 1. The user has loaded the site for the first time and the Menus API response
 * has yet to be returned or cached in the Browser Storage APIs.
 *
 * 2. The Menu API REST API response fails and there is no response cached in the
 * Browser Storage.
 *
 * As a result of these conditions being an edge case, in most cases the user will
 * not see these menus items. They are a safe guard in case of error.
 *
 * As a rule the menu items are intended to be as close to the anticipated Menus API
 * response as possible but we should not take this too far. We need only show the bear
 * minimum required to navigate in the case that the API response fails.
 */
/* eslint-enable jsdoc/require-param */

const JETPACK_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 40 40' %3E%3Cpath fill='%23a0a5aa' d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm11 17H21v19l10-19zM19 4L9 23h10V4z'/%3E%3C/svg%3E`;
const WOOCOMMERCE_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGZpbGw9IiNhMmFhYjIiIGQ9Ik02MTIuMTkyIDQyNi4zMzZjMC02Ljg5Ni0zLjEzNi01MS42LTI4LTUxLjYtMzcuMzYgMC00Ni43MDQgNzIuMjU2LTQ2LjcwNCA4Mi42MjQgMCAzLjQwOCAzLjE1MiA1OC40OTYgMjguMDMyIDU4LjQ5NiAzNC4xOTItLjAzMiA0Ni42NzItNzIuMjg4IDQ2LjY3Mi04OS41MnptMjAyLjE5MiAwYzAtNi44OTYtMy4xNTItNTEuNi0yOC4wMzItNTEuNi0zNy4yOCAwLTQ2LjYwOCA3Mi4yNTYtNDYuNjA4IDgyLjYyNCAwIDMuNDA4IDMuMDcyIDU4LjQ5NiAyNy45NTIgNTguNDk2IDM0LjE5Mi0uMDMyIDQ2LjY4OC03Mi4yODggNDYuNjg4LTg5LjUyek0xNDEuMjk2Ljc2OGMtNjguMjI0IDAtMTIzLjUwNCA1NS40ODgtMTIzLjUwNCAxMjMuOTJ2NjUwLjcyYzAgNjguNDMyIDU1LjI5NiAxMjMuOTIgMTIzLjUwNCAxMjMuOTJoMzM5LjgwOGwxMjMuNTA0IDEyMy45MzZWODk5LjMyOGgyNzguMDQ4YzY4LjIyNCAwIDEyMy41Mi01NS40NzIgMTIzLjUyLTEyMy45MnYtNjUwLjcyYzAtNjguNDMyLTU1LjI5Ni0xMjMuOTItMTIzLjUyLTEyMy45MmgtNzQxLjM2em01MjYuODY0IDQyMi4xNmMwIDU1LjA4OC0zMS4wODggMTU0Ljg4LTEwMi42NCAxNTQuODgtNi4yMDggMC0xOC40OTYtMy42MTYtMjUuNDI0LTYuMDE2LTMyLjUxMi0xMS4xNjgtNTAuMTkyLTQ5LjY5Ni01Mi4zNTItNjYuMjU2IDAgMC0zLjA3Mi0xNy43OTItMy4wNzItNDAuNzUyIDAtMjIuOTkyIDMuMDcyLTQ1LjMyOCAzLjA3Mi00NS4zMjggMTUuNTUyLTc1LjcyOCA0My41NTItMTA2LjczNiA5Ni40NDgtMTA2LjczNiA1OS4wNzItLjAzMiA4My45NjggNTguNTI4IDgzLjk2OCAxMTAuMjA4ek00ODYuNDk2IDMwMi40YzAgMy4zOTItNDMuNTUyIDE0MS4xNjgtNDMuNTUyIDIxMy40MjR2NzUuNzEyYy0yLjU5MiAxMi4wOC00LjE2IDI0LjE0NC0yMS44MjQgMjQuMTQ0LTQ2LjYwOCAwLTg4Ljg4LTE1MS40NzItOTIuMDE2LTE2MS44NC02LjIwOCA2Ljg5Ni02Mi4yNCAxNjEuODQtOTYuNDQ4IDE2MS44NC0yNC44NjQgMC00My41NTItMTEzLjY0OC00Ni42MDgtMTIzLjkzNkMxNzYuNzA0IDQzNi42NzIgMTYwIDMzNC4yMjQgMTYwIDMyNy4zMjhjMC0yMC42NzIgMS4xNTItMzguNzM2IDI2LjA0OC0zOC43MzYgNi4yMDggMCAyMS42IDYuMDY0IDIzLjcxMiAxNy4xNjggMTEuNjQ4IDYyLjAzMiAxNi42ODggMTIwLjUxMiAyOS4xNjggMTg1Ljk2OCAxLjg1NiAyLjkyOCAxLjUwNCA3LjAwOCA0LjU2IDEwLjQzMiAzLjE1Mi0xMC4yODggNjYuOTI4LTE2OC43ODQgOTQuOTYtMTY4Ljc4NCAyMi41NDQgMCAzMC40IDQ0LjU5MiAzMy41MzYgNjEuODI0IDYuMjA4IDIwLjY1NiAxMy4wODggNTUuMjE2IDIyLjQxNiA4Mi43NTIgMC0xMy43NzYgMTIuNDgtMjAzLjEyIDY1LjM5Mi0yMDMuMTIgMTguNTkyLjAzMiAyNi43MDQgNi45MjggMjYuNzA0IDI3LjU2OHpNODcwLjMyIDQyMi45MjhjMCA1NS4wODgtMzEuMDg4IDE1NC44OC0xMDIuNjQgMTU0Ljg4LTYuMTkyIDAtMTguNDQ4LTMuNjE2LTI1LjQyNC02LjAxNi0zMi40MzItMTEuMTY4LTUwLjE3Ni00OS42OTYtNTIuMjg4LTY2LjI1NiAwIDAtMy44ODgtMTcuOTItMy44ODgtNDAuODk2czMuODg4LTQ1LjE4NCAzLjg4OC00NS4xODRjMTUuNTUyLTc1LjcyOCA0My40ODgtMTA2LjczNiA5Ni4zODQtMTA2LjczNiA1OS4xMDQtLjAzMiA4My45NjggNTguNTI4IDgzLjk2OCAxMTAuMjA4eiIvPjwvc3ZnPg==`;

export default function buildFallbackResponse( {
	siteDomain = '',
	isAtomic,
	isPlanExpired,
	shouldShowMailboxes = false,
	shouldShowLinks = false,
	shouldShowTestimonials = false,
	shouldShowPortfolio = false,
	shouldShowWooCommerce = false,
	shouldShowThemes = false,
	shouldShowApperanceHeader = false,
	shouldShowApperanceBackground = false,
	shouldShowAdControl = false,
	shouldShowAddOns = false,
	showSiteMonitoring = false,
} = {} ) {
	let mailboxes = [];
	if ( shouldShowMailboxes ) {
		mailboxes = [
			{
				icon: 'dashicons-email',
				slug: 'mailboxes',
				title: translate( 'My Mailboxes' ),
				type: 'menu-item',
				url: `/mailboxes/${ siteDomain }`,
			},
		];
	}

	const fallbackResponse = [
		{
			icon: 'dashicons-admin-home',
			slug: 'home',
			title: translate( 'My Home' ),
			type: 'menu-item',
			url: `/home/${ siteDomain }`,
		},
		{
			icon: 'dashicons-chart-bar',
			slug: 'stats',
			title: translate( 'Stats' ),
			type: 'menu-item',
			url: `/stats/day/${ siteDomain }`,
		},
		{
			icon: 'dashicons-cart',
			slug: 'upgrades',
			title: translate( 'Upgrades' ),
			type: 'menu-item',
			url: `/plans/${ siteDomain }`,
			children: [
				{
					parent: 'upgrades',
					slug: 'Plans',
					title: translate( 'Plans' ),
					type: 'submenu-item',
					url: `/plans/${ siteDomain }`,
				},
				...( shouldShowAddOns
					? [
							{
								parent: 'upgrades',
								slug: 'Add-Ons',
								title: translate( 'Add-Ons' ),
								type: 'submenu-item',
								url: `/add-ons/${ siteDomain }`,
							},
					  ]
					: [] ),
				{
					parent: 'upgrades',
					slug: 'Domains',
					title: translate( 'Domains' ),
					type: 'submenu-item',
					url: `/domains/manage/${ siteDomain }`,
				},
				{
					parent: 'upgrades',
					slug: 'Emails',
					title: translate( 'Emails' ),
					type: 'submenu-item',
					url: `/email/${ siteDomain }`,
				},
				{
					parent: 'upgrades',
					slug: 'Purchases',
					title: translate( 'Purchases' ),
					type: 'submenu-item',
					url: `/purchases/subscriptions/${ siteDomain }`,
				},
			],
		},
		...mailboxes,
		{
			icon: 'dashicons-admin-post',
			slug: 'edit-php',
			title: translate( 'Posts' ),
			type: 'menu-item',
			url: `/posts/${ siteDomain }`,
			children: [
				{
					parent: 'edit.php',
					slug: 'edit-php',
					title: translate( 'All Posts' ),
					type: 'submenu-item',
					url: `/posts/${ siteDomain }`,
				},
				{
					parent: 'edit.php',
					slug: 'post-new-php',
					title: translate( 'Add New', { context: 'post' } ),
					type: 'submenu-item',
					url: `/post/${ siteDomain }`,
				},
				{
					parent: 'edit.php',
					slug: 'edit-tags-phptaxonomycategory',
					title: translate( 'Categories' ),
					type: 'submenu-item',
					url: `/settings/taxonomies/category/${ siteDomain }`,
				},
				{
					parent: 'edit.php',
					slug: 'edit-tags-phptaxonomypost_tag',
					title: translate( 'Tags' ),
					type: 'submenu-item',
					url: `/settings/taxonomies/post_tag/${ siteDomain }`,
				},
			],
		},
		{
			icon: 'dashicons-admin-media',
			slug: 'upload-php',
			title: translate( 'Media' ),
			type: 'menu-item',
			url: `/media/${ siteDomain }`,
		},
		...( shouldShowLinks
			? [
					{
						icon: 'dashicons-admin-links',
						slug: 'link-manager-php',
						title: translate( 'Links' ),
						type: 'menu-item',
						url: `https://${ siteDomain }/wp-admin/link-manager.php`,
						children: [
							{
								parent: 'link-manager.php',
								slug: 'link-manager-php',
								title: translate( 'All Links' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/link-manager.php`,
							},
							{
								parent: 'link-manager.php',
								slug: 'link-add-php',
								title: translate( 'Add New', { context: 'link' } ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/link-add.php`,
							},
							{
								parent: 'link-manager.php',
								slug: 'edit-tags-phptaxonomylink_category',
								title: translate( 'Link Categories' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/edit-tags.php?taxonomy=link_category`,
							},
						],
					},
			  ]
			: [] ),
		{
			icon: 'dashicons-admin-page',
			slug: 'edit-phppost_typepage',
			title: translate( 'Pages' ),
			type: 'menu-item',
			url: `/pages/${ siteDomain }`,
			children: [
				{
					parent: 'edit.php?post_type=page',
					slug: 'edit-phppost_typepage',
					title: translate( 'All Pages' ),
					type: 'submenu-item',
					url: `/pages/${ siteDomain }`,
				},
				{
					parent: 'edit.php?post_type=page',
					slug: 'post-new-phppost_typepage',
					title: translate( 'Add New', { context: 'page' } ),
					type: 'submenu-item',
					url: `/page/${ siteDomain }`,
				},
			],
		},
		...( shouldShowTestimonials
			? [
					{
						icon: 'dashicons-admin-links',
						slug: 'testimonials',
						title: translate( 'Testimonials' ),
						type: 'menu-item',
						url: `/types/jetpack-testimonial/${ siteDomain }`,
						children: [
							{
								parent: 'testimonials',
								slug: 'testimonials',
								title: translate( 'All Testimonials' ),
								type: 'submenu-item',
								url: `/types/jetpack-testimonial/${ siteDomain }`,
							},
							{
								parent: 'testimonials',
								slug: 'testimonials-add',
								title: translate( 'Add New', { context: 'testimonial' } ),
								type: 'submenu-item',
								url: `/edit/jetpack-testimonial/${ siteDomain }`,
							},
						],
					},
			  ]
			: [] ),
		...( shouldShowPortfolio
			? [
					{
						icon: 'dashicons-admin-links',
						slug: 'portfolio',
						title: translate( 'Portfolio' ),
						type: 'menu-item',
						url: `/types/jetpack-portfolio/${ siteDomain }`,
						children: [
							{
								parent: 'portfolio',
								slug: 'portfolio',
								title: translate( 'All Projects' ),
								type: 'submenu-item',
								url: `/types/jetpack-portfolio/${ siteDomain }`,
							},
							{
								parent: 'portfolio',
								slug: 'portfolio-add',
								title: translate( 'Add New', { context: 'portfolio' } ),
								type: 'submenu-item',
								url: `/edit/jetpack-portfolio/${ siteDomain }`,
							},
							{
								parent: 'portfolio',
								slug: 'portfolio-types',
								title: translate( 'Project Types' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/edit-tags.php?taxonomy=jetpack-portfolio-type&post_type=jetpack-portfolio`,
							},
							{
								parent: 'portfolio',
								slug: 'portfolio-tags',
								title: translate( 'Project Tags' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/edit-tags.php?taxonomy=jetpack-portfolio-tag&post_type=jetpack-portfolio`,
							},
						],
					},
			  ]
			: [] ),
		{
			icon: 'dashicons-admin-comments',
			slug: 'edit-comments-php',
			title: translate( 'Comments' ),
			type: 'menu-item',
			url: `/comments/all/${ siteDomain }`,
		},
		{
			icon: 'dashicons-feedback',
			slug: 'feedback',
			title: translate( 'Feedback' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/?page=feedback`,
			children: [
				{
					parent: 'feedback',
					slug: 'edit-phppost_typefeedback',
					title: translate( 'Feedback' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/admin.php?page=jetpack-forms`,
				},
				{
					parent: 'feedback',
					slug: 'polls',
					title: translate( 'Polls' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/admin.php?page=polls`,
				},
				{
					parent: 'feedback',
					slug: 'ratings',
					title: translate( 'Ratings' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/admin.php?page=ratings`,
				},
			],
		},
		{
			type: 'separator',
		},
		{
			icon: JETPACK_ICON,
			slug: 'jetpack',
			title: translate( 'Jetpack' ),
			type: 'menu-item',
			url: `/activity-log/${ siteDomain }`,
			children: [
				{
					parent: 'jetpack',
					slug: 'jetpack-activity-log',
					title: translate( 'Activity Log' ),
					type: 'submenu-item',
					url: `/activity-log/${ siteDomain }`,
				},
				{
					parent: 'jetpack',
					slug: 'jetpack-backup',
					title: translate( 'VaultPress Backup' ),
					type: 'submenu-item',
					url: `/backup/${ siteDomain }`,
				},
			],
		},
		{
			type: 'separator',
		},
		// Add WooCommerce here
		...( shouldShowWooCommerce
			? [
					{
						icon: WOOCOMMERCE_ICON,
						slug: 'woo-php',
						title: translate( 'WooCommerce' ),
						type: 'menu-item',
						url: `https://${ siteDomain }/wp-admin/admin.php?page=wc-admin`,
					},
					{
						type: 'separator',
					},
			  ]
			: [] ),
		...( shouldShowThemes
			? [
					{
						icon: 'dashicons-admin-appearance',
						slug: 'themes-php',
						title: translate( 'Appearance' ),
						type: 'menu-item',
						url: `/themes/${ siteDomain }`,
						children: [
							{
								parent: 'themes.php',
								slug: 'themes-php',
								title: translate( 'Themes' ),
								type: 'submenu-item',
								url: `/themes/${ siteDomain }`,
							},
							{
								parent: 'themes.php',
								slug: 'themes-customize',
								title: translate( 'Customize' ),
								type: 'submenu-item',
								url: `/customize/${ siteDomain }`,
							},

							...( shouldShowApperanceHeader
								? [
										{
											parent: 'themes.php',
											slug: 'themes-header',
											title: translate( 'Header' ),
											type: 'submenu-item',
											url: `https://${ siteDomain }/wp-admin/customize.php?return=%2Fwp-admin%2F&autofocus%5Bcontrol%5D=header_image`,
										},
								  ]
								: [] ),
							...( shouldShowApperanceBackground
								? [
										{
											parent: 'themes.php',
											slug: 'themes-background',
											title: translate( 'Background' ),
											type: 'submenu-item',
											url: `https://${ siteDomain }/wp-admin/customize.php?return=%2Fwp-admin%2F&autofocus%5Bcontrol%5D=background_image`,
										},
								  ]
								: [] ),
							{
								parent: 'themes.php',
								slug: 'themes-widgets',
								title: translate( 'Widgets' ),
								type: 'submenu-item',
								url: `/customize/${ siteDomain }?autofocus[panel]=widgets`,
							},
							{
								parent: 'themes.php',
								slug: 'themes-menus',
								title: translate( 'Menus' ),
								type: 'submenu-item',
								url: `/customize/${ siteDomain }?autofocus[panel]=nav_menus`,
							},
						],
					},
			  ]
			: [] ),
		{
			icon: 'dashicons-admin-plugins',
			slug: 'plugins',
			title: translate( 'Plugins' ),
			type: 'menu-item',
			url: `/plugins/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-users',
			slug: 'users-php',
			title: translate( 'Users' ),
			type: 'menu-item',
			url: `/people/team/${ siteDomain }`,
			children: [
				{
					parent: 'users.php',
					slug: 'users-all-people',
					title: translate( 'All Users' ),
					type: 'submenu-item',
					url: `/people/team/${ siteDomain }`,
				},
				{
					parent: 'users.php',
					slug: 'users-add-new',
					title: translate( 'Add New User', { context: 'user' } ),
					type: 'submenu-item',
					url: `/people/new/${ siteDomain }`,
				},
				{
					parent: 'users.php',
					slug: 'subscribers',
					title: translate( 'Subscribers' ),
					type: 'submenu-item',
					url: `/subscribers/${ siteDomain }`,
				},
				{
					parent: 'users.php',
					slug: 'users-my-profile',
					title: translate( 'My Profile' ),
					type: 'submenu-item',
					url: `/me/`,
				},
				{
					parent: 'users.php',
					slug: 'users-account-settings',
					title: translate( 'Account Settings' ),
					type: 'submenu-item',
					url: `/me/account`,
				},
			],
		},
		{
			icon: 'dashicons-admin-tools',
			slug: 'tools-php',
			title: translate( 'Tools' ),
			type: 'menu-item',
			url: `/marketing/tools/${ siteDomain }`,
			children: [
				{
					parent: 'tools.php',
					slug: 'tools-marketing',
					title: translate( 'Marketing' ),
					type: 'menu-item',
					url: `/marketing/tools/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-earn',
					title: translate( 'Monetize' ),
					type: 'menu-item',
					url: `/earn/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-import',
					title: translate( 'Import' ),
					type: 'submenu-item',
					url: `/import/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-export',
					title: translate( 'Export' ),
					type: 'submenu-item',
					url: `/export/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-github-deployments',
					title: translate( 'GitHub Deployments' ),
					type: 'submenu-item',
					url: `/github-deployments/${ siteDomain }`,
				},
				...( showSiteMonitoring
					? [
							{
								parent: 'tools.php',
								slug: 'tools-site-monitoring',
								title: translate( 'Site Monitoring' ),
								type: 'submenu-item',
								url: `/site-monitoring/${ siteDomain }`,
							},
					  ]
					: [] ),
			],
		},
		{
			icon: 'dashicons-admin-settings',
			slug: 'options-general-php',
			title: translate( 'Settings' ),
			type: 'menu-item',
			url: `/settings/general/${ siteDomain }`,
			children: [
				{
					parent: 'options-general.php',
					slug: 'options-general-php',
					title: translate( 'General' ),
					type: 'submenu-item',
					url: `/settings/general/${ siteDomain }`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-reading-php',
					title: translate( 'Reading' ),
					type: 'submenu-item',
					url: `/settings/reading/${ siteDomain }`,
				},
				...( config.isEnabled( 'settings/newsletter-settings-page' )
					? [
							{
								parent: 'options-general.php',
								slug: 'options-newsletter-php',
								title: translate( 'Newsletter' ),
								type: 'submenu-item',
								url: `/settings/newsletter/${ siteDomain }`,
							},
					  ]
					: [] ),
				{
					parent: 'options-podcasting.php',
					slug: 'options-podcasting-php',
					title: translate( 'Podcasting' ),
					type: 'submenu-item',
					url: `/settings/podcasting/${ siteDomain }`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-domains-php',
					title: translate( 'Domains' ),
					type: 'submenu-item',
					url: `/domains/manage/${ siteDomain }`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-media-php',
					title: translate( 'Media' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/options-media.php`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-sharing-php',
					title: translate( 'Sharing' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/options-general.php?page=sharing`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-hosting-configuration-php',
					title:
						isAtomic && ! isPlanExpired
							? translate( 'Server Settings' )
							: translate( 'Hosting Features' ),
					type: 'submenu-item',
					url: `/hosting-config/${ siteDomain }`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-polls-php',
					title: translate( 'Polls' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/options-general.php?page=polls&action=options`,
				},
				{
					parent: 'options-general.php',
					slug: 'options-ratings-php',
					title: translate( 'Ratings' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/options-general.php?page=ratings&action=options`,
				},
				...( shouldShowAdControl
					? [
							{
								parent: 'options-general.php',
								slug: 'options-ad-control',
								title: translate( 'AdControl' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/options-general.php?page=adcontrol`,
							},
					  ]
					: [] ),
			],
		},
	];

	return fallbackResponse;
}
