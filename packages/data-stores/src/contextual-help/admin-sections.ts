import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { __, sprintf } from '@wordpress/i18n';

export function generateAdminSections(
	siteSlug: string,
	customizerUrls: {
		root: string;
		homepage: string;
		menus: string;
		identity: string;
	},
	siteEditorUrls: {
		root: string;
		wp_global_styles: string;
	},
	googleMailService: string,
	onboardingUrl: string,
	isJetpack?: boolean
) {
	return [
		{
			title: __( 'Add a new domain', __i18n_text_domain__ ),
			description: __(
				'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
			),
			link: `/domains/add/${ siteSlug }`,
			synonyms: [ 'domains' ],
			icon: 'domains',
		},
		{
			title: __( 'Manage my domain settings', __i18n_text_domain__ ),
			description: __( 'Manage all domains linked to your account.', __i18n_text_domain__ ),
			link: `/domains/manage/${ siteSlug }`,
			synonyms: [ 'domains' ],
			icon: 'domains',
		},
		{
			title: __( 'Change my site address', __i18n_text_domain__ ),
			link: `/domains/manage/${ siteSlug }/edit/${ siteSlug }`,
			synonyms: [ 'domains', 'domain' ],
			icon: 'domains',
		},
		{
			title: __( 'Add a site redirect', __i18n_text_domain__ ),
			description: __( 'Redirect your site to another domain.', __i18n_text_domain__ ),
			link: `/domains/add/site-redirect/${ siteSlug }`,
			synonyms: [ 'domains', 'domain', 'forward' ],
			icon: 'domains',
		},
		{
			title: __( 'Change my password', __i18n_text_domain__ ),
			link: '/me/security',
			synonyms: [ 'update' ],
			icon: 'cog',
		},
		{
			title: __( "Change my site's theme" ),
			link: `/themes/${ siteSlug }`,
			synonyms: [ 'switch', 'design' ],
			icon: 'customize',
		},
		{
			title: __( "Customize my site's theme" ),
			link: ! isJetpack ? siteEditorUrls.wp_global_styles : customizerUrls.root,
			synonyms: [ 'color', 'font', 'design', 'css', 'widgets' ],
			icon: 'customize',
		},
		{
			title: __( 'Change my homepage', __i18n_text_domain__ ),
			link: customizerUrls.homepage,
			synonyms: [ 'home', 'homepage' ],
			icon: 'customize',
		},
		{
			title: __( 'Edit my menu', __i18n_text_domain__ ),
			link: customizerUrls.menus,
			synonyms: [ 'menu' ],
			icon: 'customize',
		},
		{
			title: __( 'Set a site logo', __i18n_text_domain__ ),
			link: customizerUrls.identity,
			synonyms: [ 'logo', 'identity' ],
			icon: 'customize',
		},
		{
			title: __( 'Find a plan to suit my site', __i18n_text_domain__ ),
			link: `/plans/${ siteSlug }`,
			synonyms: [ 'upgrade', 'business', 'professional', 'personal' ],
			icon: 'plans',
		},
		{
			title: __( 'Cancel my plan', __i18n_text_domain__ ),
			link: '/me/purchases',
			synonyms: [ 'upgrade', 'business', 'professional', 'personal' ],
			icon: 'plans',
		},
		{
			title: __( 'Upgrade my plan', __i18n_text_domain__ ),
			link: `/plans/${ siteSlug }`,
			synonyms: [ 'upgrade', 'business', 'professional', 'personal' ],
			icon: 'plans',
		},
		{
			/* translators: %(googleMailService)s can be either "G Suite" or "Google Workspace */
			title: sprintf( __( 'Cancel %s', __i18n_text_domain__ ), googleMailService ),
			link: '/me/purchases',
			synonyms: [ 'upgrade', 'business', 'professional', 'personal', 'google' ],
			icon: 'plans',
		},
		{
			title: __( 'Renew my plan', __i18n_text_domain__ ),
			link: `/plans/${ siteSlug }`,
			synonyms: [ 'upgrade', 'business', 'professional', 'personal', 'plan' ],
			icon: 'plans',
		},
		{
			title: __( 'Renew my domain', __i18n_text_domain__ ),
			link: `/plans/${ siteSlug }`,
			synonyms: [ 'domain', 'business', 'professional', 'personal', 'plan' ],
			icon: 'plans',
		},
		{
			title: __( 'View my site activity', __i18n_text_domain__ ),
			link: `/activity-log/${ siteSlug }`,
			icon: 'history',
		},
		{
			title: __( "View my site's latest stats" ),
			link: `/stats/day/${ siteSlug }`,
			synonyms: [ 'analytics' ],
			icon: 'stats-alt',
		},
		{
			title: __( 'Upload an image, video, audio or document', __i18n_text_domain__ ),
			link: `/media/${ siteSlug }`,
			synonyms: [ 'media', 'photo' ],
			icon: 'image',
		},
		{
			title: __( 'Import content from another site', __i18n_text_domain__ ),
			link: `/settings/import/${ siteSlug }`,
			synonyms: [ 'medium', 'blogger', 'wix', 'squarespace' ],
			icon: 'cloud-upload',
		},
		{
			title: __( 'Earn money from my site', __i18n_text_domain__ ),
			description: sprintf(
				// translators: %s is the name of the Explorer/Premium plan.
				__(
					"By upgrading to the %s plan, you'll be able to monetize your site through the WordAds program."
				),
				getPlan( PLAN_PREMIUM )?.getTitle()
			),
			link: `/earn/${ siteSlug }`,
			synonyms: [ 'monetize', 'wordads', 'premium', 'explorer' ],
			icon: 'money',
		},
		{
			title: __( 'Learn how to market my site', __i18n_text_domain__ ),
			link: `/marketing/tools/${ siteSlug }`,
			synonyms: [ 'marketing', 'brand', 'logo', 'seo', 'tools', 'traffic' ],
			icon: 'speaker',
		},
		{
			title: __( "Manage my site's users" ),
			description: __( 'Invite new users and edit existing ones.', __i18n_text_domain__ ),
			link: `/people/team/${ siteSlug }`,
			synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
			icon: 'user',
		},
		{
			title: __( 'Invite new users to my site', __i18n_text_domain__ ),
			link: `/people/new/${ siteSlug }`,
			synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
			icon: 'user',
		},
		{
			title: __( "Change my site's timezone" ),
			link: `/settings/general/${ siteSlug }#site-settings__blogtimezone`,
			synonyms: [ 'time', 'date' ],
			icon: 'cog',
		},
		{
			title: __( 'Launch my site', __i18n_text_domain__ ),
			description: __( 'Switch your site from private to public.', __i18n_text_domain__ ),
			link: `/settings/general/${ siteSlug }#site-privacy-settings`,
			synonyms: [ 'private', 'public' ],
			icon: 'cog',
		},
		{
			title: __( "Delete a site or a site's content" ),
			description: __(
				'Remove all posts, pages, and media, or delete a site completely.',
				__i18n_text_domain__
			),
			link: `/settings/general/${ siteSlug }#site-tools__header`,
			icon: 'cog',
		},
		{
			title: __( 'Set a site icon', __i18n_text_domain__ ),
			link: `/settings/general/${ siteSlug }`,
			icon: 'cog',
			synonyms: [ 'logo' ],
		},
		{
			title: __( "Change my site's footer text" ),
			description: __(
				'You can customize your website by changing the footer credit in customizer.'
			),
			link: `/settings/general/${ siteSlug }#site-settings__footer-credit-header`,
			synonyms: [ 'remove footer', 'update footer' ],
			icon: 'cog',
		},
		{
			title: __( "Export my site's content and media library" ),
			description: __( 'Export posts, pages and more from your site.', __i18n_text_domain__ ),
			link: `/settings/export/${ siteSlug }`,
			synonyms: [ 'xml', 'images', 'migration', 'import', 'download' ],
			icon: 'cog',
		},
		{
			title: __( 'Manage sharing and social media connections', __i18n_text_domain__ ),
			link: `/sharing/${ siteSlug }`,
			synonyms: [ 'facebook', 'twitter', 'twitter', 'tumblr', 'eventbrite' ],
			icon: 'share',
		},
		{
			title: __( 'Add sharing buttons to my site', __i18n_text_domain__ ),
			description: __(
				'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.'
			),
			link: `/sharing/buttons/${ siteSlug }`,
			synonyms: [ 'like', 'reblog' ],
			icon: 'share',
		},
		{
			title: __( 'Install, manage, and search for site Plugins', __i18n_text_domain__ ),
			link: `/plugins/${ siteSlug }`,
			synonyms: [ 'upload' ],
			icon: 'plugins',
		},
		{
			title: __( 'Approve or delete comments', __i18n_text_domain__ ),
			link: `/comments/all/${ siteSlug }`,
			synonyms: [ 'spam', 'discussion', 'moderation', 'moderate' ],
			icon: 'chat',
		},
		{
			title: __( 'Manage how users can comment on my site', __i18n_text_domain__ ),
			link: `/settings/discussion/${ siteSlug }`,
			synonyms: [ 'discussion', 'moderation', 'blocklist' ],
			icon: 'cog',
		},
		{
			title: __( 'Manage post categories', __i18n_text_domain__ ),
			link: `/settings/taxonomies/category/${ siteSlug }`,
			synonyms: [ 'post', 'category' ],
			icon: 'cog',
		},
		{
			title: __( 'Edit my site title, tagline, or logo', __i18n_text_domain__ ),
			link: `/settings/general/${ siteSlug }`,
			synonyms: [ 'title', 'logo' ],
			icon: 'cog',
		},
		{
			title: __( 'Set up a podcast', __i18n_text_domain__ ),
			link: `/settings/podcasting/${ siteSlug }`,
			synonyms: [ 'podcast', 'radio', 'audio' ],
			icon: 'cog',
		},
		{
			title: __( "Change my site's privacy settings" ),
			link: `/settings/general/${ siteSlug }#site-privacy-settings`,
			synonyms: [ 'privacy' ],
			icon: 'cog',
		},
		{
			title: __( 'Manage SEO and traffic settings', __i18n_text_domain__ ),
			link: `/settings/traffic/${ siteSlug }`,
			synonyms: [ 'analytics', 'related', 'sitemap' ],
			icon: 'cog',
		},
		{
			title: __( 'Update my profile', __i18n_text_domain__ ),
			description: __( 'Update your name, profile image, and about text.', __i18n_text_domain__ ),
			link: '/me',
			synonyms: [ 'avatar' ],
			icon: 'user',
		},
		{
			title: __( 'Update my username or email address', __i18n_text_domain__ ),
			link: '/me/account',
			synonyms: [ 'user', 'account' ],
			icon: 'cog',
		},
		{
			title: __( 'Change the dashboard color scheme', __i18n_text_domain__ ),
			link: '/me/account#account__color_scheme',
			synonyms: [ 'theme' ],
			icon: 'cog',
		},
		{
			title: __( 'Switch the interface language', __i18n_text_domain__ ),
			description: __(
				'Update the language of the interface you see across WordPress.com as a whole.'
			),
			link: '/me/account#account__language',
			synonyms: [ 'dashboard', 'change', 'language' ],
			icon: 'cog',
		},
		{
			title: __( 'Close my account permanently', __i18n_text_domain__ ),
			description: __(
				'Delete all of your sites, and close your account completely.',
				__i18n_text_domain__
			),
			link: '/me/account/close',
			synonyms: [ 'delete' ],
			icon: 'cog',
		},
		{
			title: __( 'Change my account privacy settings', __i18n_text_domain__ ),
			link: '/me/privacy',
			synonyms: [ 'security', 'tracking' ],
			icon: 'visible',
		},
		{
			title: __( 'View my purchase and billing history', __i18n_text_domain__ ),
			link: '/me/purchases',
			synonyms: [ 'purchases', 'invoices', 'pending', 'payment', 'credit card' ],
			icon: 'credit-card',
		},
		{
			title: __( 'Download the WordPress.com app for my device', __i18n_text_domain__ ),
			description: __( 'Get WordPress apps for all your screens.', __i18n_text_domain__ ),
			link: '/me/get-apps',
			synonyms: [ 'android', 'iphone', 'mobile', 'desktop', 'phone' ],
			icon: 'my-sites',
		},
		{
			title: __( 'View my drafted posts', __i18n_text_domain__ ),
			link: `/posts/drafts/${ siteSlug }`,
			synonyms: [ 'posts', 'draft' ],
			icon: 'my-sites',
		},
		{
			title: __( 'Manage my blog posts', __i18n_text_domain__ ),
			link: `/posts/${ siteSlug }`,
			synonyms: [ 'lists', 'posts' ],
			icon: 'my-sites',
		},
		{
			title: __( 'New post', __i18n_text_domain__ ),
			description: __( 'Create a new blog post on your site.' ),
			link: `/post/${ siteSlug }`,
			synonyms: [ 'lists', 'posts' ],
			icon: 'my-sites',
		},
		{
			title: __( 'View my drafted pages', __i18n_text_domain__ ),
			link: `/pages/drafts/${ siteSlug }`,
			synonyms: [ 'pages', 'draft' ],
			icon: 'my-sites',
		},
		{
			title: __( 'Manage my pages', __i18n_text_domain__ ),
			link: `/pages/${ siteSlug }`,
			synonyms: [ 'lists', 'pages' ],
			icon: 'my-sites',
		},
		{
			title: __( 'I cannot find my site on Google', __i18n_text_domain__ ),
			link: `/marketing/traffic/${ siteSlug }`,
			synonyms: [ 'google', 'traffic', 'seo' ],
			icon: 'speaker',
		},
		{
			title: __( 'Verify my site with Google', __i18n_text_domain__ ),
			link: `/marketing/traffic/${ siteSlug }`,
			synonyms: [ 'google', 'traffic', 'seo' ],
			icon: 'cog',
		},
		{
			title: __( 'Create a new site', __i18n_text_domain__ ),
			link: `${ onboardingUrl }?ref=calypso-inline-help`,
			synonyms: [ 'site' ],
			icon: 'cog',
		},
		{
			title: __( 'View contact form messages', __i18n_text_domain__ ),
			link: `https://${ siteSlug }/wp-admin/admin.php?page=jetpack-forms-admin`,
			synonyms: [ 'contact', 'form' ],
			icon: 'cog',
		},
		{
			title: __( 'Portfolio projects (for those who have them active)', __i18n_text_domain__ ),
			link: `/types/jetpack-portfolio/${ siteSlug }`,
			synonyms: [ 'portfolio' ],
			icon: 'cog',
		},
	];
}
