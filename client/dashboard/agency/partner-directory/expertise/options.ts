import { __ } from '@wordpress/i18n';
import type { AgencyPartnerDirectorySlug } from '@automattic/api-core';

/**
 * The services an agency can offer, keyed by the slug the API stores.
 */
export const getAvailableServices = (): Record< string, string > => ( {
	seo: __( 'Search Engine Optimization (SEO)' ),
	email_marketing_social_media: __( 'Email Marketing & Social Media' ),
	content_strategy_development: __( 'Content Strategy & Development' ),
	paid_advertising: __( 'Paid Advertising' ),
	website_online_store_development: __( 'Website or Online Store Development' ),
	site_migration_platform_integration: __( 'Site Migration and Platform Integration' ),
	site_maintenance_platform_integration: __( 'Site Maintenance & Plugin Management' ),
	website_performance_optimization: __( 'Website Performance Optimization' ),
	conversion_rate_checkout_optimization: __( 'Conversion Rate & Checkout Optimization' ),
	ecommerce_consulting: __( 'eCommerce Consulting' ),
	growth_consulting: __( 'Growth Consulting' ),
	accessibility_consulting: __( 'Accessibility Consulting' ),
	security_consulting: __( 'Security Consulting' ),
	international_multilingual_consulting: __( 'International and Multilingual Consulting' ),
	ai_powered_web_applications: __( 'AI-powered Web Applications' ),
	headless_wordpress_and_woo: __( 'Headless WordPress & Woo' ),
} );

/**
 * The Automattic products an agency can work with, keyed by the slug the API
 * stores. Product names are brands, so they are not translated.
 */
export const getAvailableProducts = (): Record< string, string > => ( {
	wordpress_com: 'WordPress.com',
	woocommerce: 'WooCommerce',
	jetpack: 'Jetpack',
	wordpress_vip: 'WordPress VIP',
	pressable: 'Pressable',
} );

/**
 * The directories an agency can apply to. A subset of the known directories:
 * VIP listings are managed by Automattic and can't be applied for.
 */
export const SELECTABLE_DIRECTORIES: AgencyPartnerDirectorySlug[] = [
	'wordpress',
	'woocommerce',
	'jetpack',
	'pressable',
];
