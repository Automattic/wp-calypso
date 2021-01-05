/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export default function buildFallbackResponse( {
	siteDomain = '',
	shouldShowLinks = false,
	shouldShowTestimonials = false,
	shouldShowPortfolio = false,
	shouldShowWooCommerce = false,
	shouldShowApperanceHeaderAndBackground = false,
	shouldShowAdControl = false,
	shouldShowAMP = false,
	shouldShowThemeOptions = false,
} = {} ) {
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
			slug: 'purchases',
			title: translate( 'Purchases' ),
			type: 'menu-item',
			url: `/purchases/${ siteDomain }`,
		},
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
					title: translate( 'Add New' ),
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
								title: translate( 'Add New' ),
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
					title: translate( 'Add New' ),
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
								title: translate( 'Add New' ),
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
								title: translate( 'Add New' ),
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
					url: `https://${ siteDomain }/wp-admin/edit.php?post_type=feedback`,
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
			icon: 'dashicons-jetpack',
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
					title: translate( 'Backup' ),
					type: 'submenu-item',
					url: `/backup/${ siteDomain }`,
				},
				{
					parent: 'jetpack',
					slug: 'jetpack-scan',
					title: translate( 'Scan' ),
					type: 'submenu-item',
					url: `/scan/${ siteDomain }`,
				},
			],
		},
		{
			type: 'separator',
		},
		// Add WooCommerce here
		...( shouldShowWooCommerce ? [] : [] ),
		{
			type: 'separator',
		},
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
				...( shouldShowApperanceHeaderAndBackground
					? [
							{
								parent: 'themes.php',
								slug: 'themes-header',
								title: translate( 'Header' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/customize.php?return=%2Fwp-admin%2F&autofocus%5Bcontrol%5D=header_image`,
							},
							{
								parent: 'themes.php',
								slug: 'themes-background',
								title: translate( 'Background' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/customize.php?return=%2Fwp-admin%2F&autofocus%5Bcontrol%5D=background_image`,
							},
					  ]
					: [] ),
				...( shouldShowThemeOptions
					? [
							{
								parent: 'themes.php',
								slug: 'themes-options',
								title: translate( 'Theme Options' ),
								type: 'submenu-item',
								url: `https://${ siteDomain }/wp-admin/`,
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
					title: translate( 'All People' ),
					type: 'submenu-item',
					url: `/people/team/${ siteDomain }`,
				},
				{
					parent: 'users.php',
					slug: 'users-add-new',
					title: translate( 'Add New' ),
					type: 'submenu-item',
					url: `/people/new/${ siteDomain }`,
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
					title: translate( 'Earn' ),
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
					url: `https://${ siteDomain }/wp-admin/options-reading.php`,
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
					title: translate( 'Hosting Configuration' ),
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
		...( shouldShowAMP
			? [
					{
						slug: 'amp',
						title: translate( 'AMP' ),
						type: 'menu-item',
						url: `https://${ siteDomain }/wp-admin/admin.php?page=amp-options`,
					},
			  ]
			: [] ),
	];

	return fallbackResponse;
}
