import { __ } from '@wordpress/i18n';
import type { PureFooterProps } from '../types';

type LocalizeUrl = NonNullable< PureFooterProps[ 'localizeUrl' ] >;

export interface FooterLink {
	slug: string;
	label: string;
	url: string;
	/** Renders the label inside the external-link chevron span, like the twin. */
	chevron?: boolean;
	/** The twin tags the CCPA privacy-notice link with data-is-ccpa-dnsd. */
	isCcpaNotice?: boolean;
}

export interface FooterColumn {
	id: 'products' | 'features' | 'resources' | 'help' | 'support' | 'company';
	title: string;
	links: FooterLink[];
}

interface GetFooterColumnsArgs {
	localizeUrl: LocalizeUrl;
	locale?: string;
	isLoggedIn?: boolean;
}

// The footer taxonomy that ships today. Keep in sync with the WPCOM twin in
// wp-content/a8c-plugins/wpcom-global-nav/.
export function getFooterColumns( {
	localizeUrl,
	locale,
	isLoggedIn,
}: GetFooterColumnsArgs ): FooterColumn[] {
	return [
		{
			id: 'products',
			title: __( 'Products', __i18n_text_domain__ ),
			links: [
				{
					slug: 'hosting',
					label: __( 'WordPress Hosting', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/hosting/' ),
				},
				{
					slug: 'agencies',
					label: __( 'WordPress for Agencies', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/for-agencies/' ),
				},
				{
					slug: 'ecommerce',
					label: __( 'Ecommerce', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/ecommerce/' ),
				},
				{
					slug: 'affiliates',
					label: __( 'Become an Affiliate', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/affiliates/' ),
				},
				{
					slug: 'domains',
					label: __( 'Domain Names', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/domains/' ),
				},
				{
					slug: 'ai-website-builder-footer',
					label: __( 'AI Website Builder', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/ai-website-builder/' ),
				},
				{
					slug: 'website-builder',
					label: __( 'Website Builder', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/website-builder/' ),
				},
				{
					slug: 'create-blog',
					label: __( 'Create a Blog', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/create-blog/' ),
				},
				{
					slug: 'email',
					label: __( 'Professional Email', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/professional-email/' ),
				},
				{
					slug: 'website-design-service',
					label: __( 'Website Design Services', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/website-design-service/' ),
				},
				{
					slug: 'wp-studio',
					label: __( 'WordPress Studio', __i18n_text_domain__ ),
					url: 'https://developer.wordpress.com/studio/',
					chevron: true,
				},
				{
					slug: 'vip',
					label: __( 'Enterprise WordPress', __i18n_text_domain__ ),
					url: 'https://wpvip.com/wordpress-vip-agile-content-platform/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=footer',
					chevron: true,
				},
			],
		},
		{
			id: 'features',
			title: __( 'Features', __i18n_text_domain__ ),
			links: [
				{
					slug: 'features',
					label: __( 'Overview', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/features/' ),
				},
				{
					slug: 'themes',
					label: __( 'WordPress Themes', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/themes', locale, isLoggedIn ),
				},
				{
					slug: 'plugins',
					label: __( 'WordPress Plugins', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/plugins', locale, isLoggedIn ),
				},
				{
					slug: 'patterns',
					label: __( 'WordPress Patterns', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/patterns', locale, isLoggedIn ),
				},
				{
					slug: 'ai',
					label: __( 'WordPress AI Features', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/ai/' ),
				},
				{
					slug: 'google',
					label: __( 'Google Apps', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/google/' ),
				},
			],
		},
		{
			id: 'resources',
			title: __( 'Resources', __i18n_text_domain__ ),
			links: [
				{
					slug: 'blog-support',
					label: __( 'WordPress.com Blog', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/blog/' ),
				},
				{
					slug: 'business-name-generator',
					label: __( 'Business Name Generator', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/business-name-generator/' ),
				},
				{
					slug: 'logo-maker',
					label: __( 'Logo Maker', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/logo-maker/' ),
				},
				{
					slug: 'reader',
					label: __( 'WordPress.com Reader', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/discover' ),
				},
				{
					slug: 'accessibility',
					label: __( 'Accessibility', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/accessibility/' ),
				},
			],
		},
		{
			id: 'help',
			title: __( 'Help', __i18n_text_domain__ ),
			links: [
				{
					slug: 'support-center',
					label: __( 'Support Center', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/' ),
				},
				{
					slug: 'guides',
					label: __( 'Guides', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/guides/' ),
				},
				{
					slug: 'courses',
					label: __( 'Courses', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/courses/' ),
				},
				{
					slug: 'forums',
					label: __( 'Forums', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/forums/' ),
				},
				{
					slug: 'contact',
					label: __( 'Contact', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/contact/' ),
				},
				{
					slug: 'dev-resources',
					label: __( 'Developer Resources', __i18n_text_domain__ ),
					url: 'https://developer.wordpress.com/',
					chevron: true,
				},
			],
		},
		{
			id: 'company',
			title: __( 'Company', __i18n_text_domain__ ),
			links: [
				{
					slug: 'about',
					label: __( 'About', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/about/' ),
				},
				{
					slug: 'press',
					label: __( 'Press', __i18n_text_domain__ ),
					url: 'https://automattic.com/press/',
					chevron: true,
				},
				{
					slug: 'tos',
					label: __( 'Terms of Service', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/tos/' ),
				},
				{
					slug: 'privacy',
					label: __( 'Privacy Policy', __i18n_text_domain__ ),
					url: localizeUrl( 'https://automattic.com/privacy/' ),
					chevron: true,
				},
				{
					slug: 'ccpa-privacy',
					label: __( 'Privacy Notice for California Users', __i18n_text_domain__ ),
					url: localizeUrl(
						'https://automattic.com/privacy/#california-consumer-privacy-act-ccpa'
					),
					isCcpaNotice: true,
				},
			],
		},
	];
}

// The 2026 redesign's footer taxonomy, rendered only when a colorway is set.
// Keep in sync with the WPCOM twin in wp-content/a8c-plugins/wpcom-global-nav/.
export function getFooterColumns2026( {
	localizeUrl,
	locale,
	isLoggedIn,
}: GetFooterColumnsArgs ): FooterColumn[] {
	return [
		{
			id: 'products',
			title: __( 'Products', __i18n_text_domain__ ),
			links: [
				{
					slug: 'website-builder',
					label: __( 'Websites', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/website-builder/' ),
				},
				{
					slug: 'create-blog',
					label: __( 'Blog', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/create-blog/' ),
				},
				{
					slug: 'newsletter',
					label: __( 'Newsletter', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/newsletter/' ),
				},
				{
					slug: 'ecommerce',
					label: __( 'Ecommerce', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/ecommerce/' ),
				},
				{
					slug: 'hosting',
					label: __( 'Managed hosting', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/hosting/' ),
				},
				{
					slug: 'agencies',
					label: __( 'Agency hosting', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/for-agencies/' ),
				},
				{
					slug: 'vip',
					label: __( 'Enterprise hosting', __i18n_text_domain__ ),
					url: 'https://wpvip.com/',
					chevron: true,
				},
				{
					slug: 'domains',
					label: __( 'Domains', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/domains/' ),
				},
				{
					slug: 'site-migration',
					label: __( 'Site migration', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/move/' ),
				},
				{
					slug: 'affiliates',
					label: __( 'Affiliate program', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/affiliates/' ),
				},
				{
					slug: 'email',
					label: __( 'Professional email', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/professional-email/' ),
				},
			],
		},
		{
			id: 'features',
			title: __( 'Features', __i18n_text_domain__ ),
			links: [
				{
					slug: 'themes',
					label: __( 'Themes', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/themes', locale, isLoggedIn ),
				},
				{
					slug: 'plugins',
					label: __( 'Plugins', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/plugins', locale, isLoggedIn ),
				},
				{
					slug: 'patterns',
					label: __( 'Patterns', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/patterns', locale, isLoggedIn ),
				},
				{
					slug: 'ai',
					label: __( 'AI features', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/ai' ),
				},
			],
		},
		{
			id: 'resources',
			title: __( 'Resources', __i18n_text_domain__ ),
			links: [
				{
					slug: 'ai-website-builder-footer',
					label: __( 'AI website builder', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/ai-website-builder/' ),
				},
				{
					slug: 'blog-support',
					label: __( 'Latest news', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/blog/' ),
				},
				{
					slug: 'reader',
					label: __( 'Browse blogs', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/discover' ),
				},
				{
					slug: 'business-name-generator',
					label: __( 'Business name generator', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/business-name-generator/' ),
				},
				{
					slug: 'logo-maker',
					label: __( 'Logo generator', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/logo-maker/' ),
				},
				{
					slug: 'website-design-service',
					label: __( 'Hire an expert', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/website-design-service/' ),
				},
				{
					slug: 'dev-resources',
					label: __( 'Developer resources', __i18n_text_domain__ ),
					url: 'https://developer.wordpress.com/',
					chevron: true,
				},
				{
					slug: 'wp-studio',
					label: __( 'Studio', __i18n_text_domain__ ),
					url: 'https://developer.wordpress.com/studio/',
					chevron: true,
				},
			],
		},
		{
			id: 'support',
			title: __( 'Support', __i18n_text_domain__ ),
			links: [
				{
					slug: 'support-center',
					label: __( 'Support center', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/' ),
				},
				{
					slug: 'guides',
					label: __( 'Guides', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/guides/' ),
				},
				{
					slug: 'courses',
					label: __( 'Courses', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/courses/' ),
				},
				{
					slug: 'forums',
					label: __( 'Forums', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/forums/' ),
				},
				{
					slug: 'contact',
					label: __( 'Contact', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/support/contact/' ),
				},
			],
		},
		{
			id: 'company',
			title: __( 'Company', __i18n_text_domain__ ),
			links: [
				{
					slug: 'about',
					label: __( 'About', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/about/' ),
				},
				{
					slug: 'careers',
					label: __( 'Careers', __i18n_text_domain__ ),
					url: 'https://automattic.com/work-with-us/',
					chevron: true,
				},
				{
					slug: 'partners',
					label: __( 'Partners', __i18n_text_domain__ ),
					url: localizeUrl( 'https://wordpress.com/partners/' ),
				},
				{
					slug: 'press',
					label: __( 'Press', __i18n_text_domain__ ),
					url: 'https://automattic.com/press/',
					chevron: true,
				},
			],
		},
	];
}
