import type { Nav2026Group, Nav2026Menu } from './types';

type LocalizeUrl = (
	fullUrl: string,
	locale?: string,
	isLoggedIn?: boolean,
	useEnglishUrl?: boolean
) => string;

type Translate = ( text: string, domain?: string ) => string;

interface GetNav2026MenusArgs {
	__: Translate;
	localizeUrl: LocalizeUrl;
	locale: string;
	isLoggedIn: boolean;
}

// The 2026 nav taxonomy. Keep in sync with the WPCOM twin in
// wp-content/a8c-plugins/wpcom-global-nav/nav-item-config.php.
export function getNav2026Menus( {
	__,
	localizeUrl,
	locale,
	isLoggedIn,
}: GetNav2026MenusArgs ): Nav2026Menu[] {
	const buildGroup: Nav2026Group = {
		title: __( 'Build', __i18n_text_domain__ ),
		columnGroup: 'build',
		items: [
			{
				label: __( 'Website', __i18n_text_domain__ ),
				url: localizeUrl( '//wordpress.com/website-builder/' ),
				target: '_self',
			},
			{
				label: __( 'Ecommerce', __i18n_text_domain__ ),
				url: localizeUrl( '//wordpress.com/ecommerce/' ),
				target: '_self',
			},
			{
				label: __( 'AI website builder', __i18n_text_domain__ ),
				url: localizeUrl( '//wordpress.com/ai-website-builder/?ref=topnav' ),
				target: '_self',
			},
		],
	};
	const publishGroup: Nav2026Group = {
		title: __( 'Publish', __i18n_text_domain__ ),
		columnGroup: 'publish',
		items: [
			{
				label: __( 'Blog', __i18n_text_domain__ ),
				url: localizeUrl( '//wordpress.com/create-blog/' ),
				target: '_self',
			},
			{
				label: __( 'Newsletter', __i18n_text_domain__ ),
				url: localizeUrl( '//wordpress.com/newsletter/', locale, isLoggedIn, true ),
				target: '_self',
			},
		],
	};

	return [
		{
			name: 'products',
			title: __( 'Products', __i18n_text_domain__ ),
			groups: [
				buildGroup,
				publishGroup,
				{
					title: __( 'Hosting', __i18n_text_domain__ ),
					columnGroup: 'hosting',
					items: [
						{
							label: __( 'Managed hosting', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/hosting/' ),
							target: '_self',
						},
						{
							label: __( 'Agency hosting', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/for-agencies/' ),
							target: '_self',
						},
						{
							label: __( 'Site migration', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/move/' ),
							target: '_self',
						},
					],
				},
				{
					title: __( 'Affiliates', __i18n_text_domain__ ),
					columnGroup: 'hosting',
					items: [
						{
							label: __( 'Affiliate program', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/affiliates/' ),
							target: '_self',
						},
					],
				},
				{
					title: __( 'Enterprise', __i18n_text_domain__ ),
					columnGroup: 'hosting',
					items: [
						{
							label: __( 'Enterprise hosting', __i18n_text_domain__ ),
							url: 'https://wpvip.com/',
							isExternal: true,
						},
					],
				},
				{
					title: __( 'Domains', __i18n_text_domain__ ),
					columnGroup: 'domains',
					items: [
						{
							label: __( 'Find a domain', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/domains/' ),
							target: '_self',
						},
						{
							label: __( 'Transfer a domain', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/setup/domain-transfer' ),
							target: '_self',
						},
					],
				},
				{
					title: __( 'Email', __i18n_text_domain__ ),
					columnGroup: 'domains',
					items: [
						{
							label: __( 'Professional email', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/professional-email/' ),
							target: '_self',
						},
					],
				},
			],
		},
		{
			name: 'resources',
			title: __( 'Resources', __i18n_text_domain__ ),
			groups: [
				{
					title: __( 'Tools & Services', __i18n_text_domain__ ),
					items: [
						{
							label: __( 'Business name generator', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/business-name-generator/' ),
							target: '_self',
						},
						{
							label: __( 'Logo generator', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/logo-maker/' ),
							target: '_self',
						},
						{
							label: __( 'Speed test', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/speed-test/' ),
							target: '_self',
						},
						{
							label: __( 'Hire an expert', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/website-design-service/' ),
							target: '_self',
						},
						{
							label: __( 'Site profiler (WHOIS)', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/site-profiler' ),
							target: '_self',
						},
						{
							label: __( 'Newspack', __i18n_text_domain__ ),
							url: 'https://newspack.com/',
							isExternal: true,
						},
					],
				},
				{
					title: __( 'For Developers', __i18n_text_domain__ ),
					items: [
						{
							label: __( 'Developer tools', __i18n_text_domain__ ),
							url: 'https://developer.wordpress.com/docs/developer-tools/',
						},
						{
							label: __( 'Developer blog', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/blog/category/development/' ),
							target: '_self',
						},
						{
							label: __( 'Rest API', __i18n_text_domain__ ),
							url: 'https://developer.wordpress.com/docs/api/',
						},
						{
							label: __( 'Docs', __i18n_text_domain__ ),
							url: 'https://developer.wordpress.com/docs/',
						},
						{
							label: __( 'Studio', __i18n_text_domain__ ),
							url: localizeUrl( '//developer.wordpress.com/studio/' ),
							target: '_self',
							isExternal: true,
						},
					],
				},
				{
					title: __( 'Features', __i18n_text_domain__ ),
					items: [
						{
							label: __( 'Themes', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/themes', locale, isLoggedIn, true ),
						},
						{
							label: __( 'Plugins', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/plugins', locale, isLoggedIn, true ),
						},
						{
							label: __( 'Patterns', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/patterns', locale, isLoggedIn, true ),
						},
						{
							label: __( 'AI features', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/ai/' ),
							target: '_self',
						},
						{
							label: __( 'View all', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/features/' ),
							target: '_self',
						},
					],
				},
				{
					title: __( 'Discover', __i18n_text_domain__ ),
					items: [
						{
							label: __( 'Latest news', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/blog/' ),
							target: '_self',
						},
						{
							label: __( 'Browse blogs', __i18n_text_domain__ ),
							url: localizeUrl( '//wordpress.com/discover' ),
							target: '_self',
						},
					],
				},
			],
		},
		{
			name: 'support',
			title: __( 'Support', __i18n_text_domain__ ),
			href: localizeUrl( '//wordpress.com/support/' ),
		},
		{
			name: 'pricing',
			title: __( 'Pricing', __i18n_text_domain__ ),
			href: localizeUrl( '//wordpress.com/pricing/' ),
		},
	];
}
