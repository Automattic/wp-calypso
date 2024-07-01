import { useTranslate } from 'i18n-calypso';
import { availableLanguages } from '../../lib/available-languages';
import { DirectoryApplicationType } from '../../types';

export function reverseMap< T >( obj: Record< string, T > ): Record< string, string > {
	return Object.fromEntries( Object.entries( obj ).map( ( [ key, value ] ) => [ value, key ] ) );
}

export function useFormSelectors() {
	const translate = useTranslate();

	const availableServices: Record< string, string > = {
		seo: translate( 'Search Engine Optimization (SEO)' ),
		email_marketing_social_media: translate( 'Email Marketing & Social Media' ),
		content_strategy_development: translate( 'Content Strategy & Development' ),
		paid_advertising: translate( 'Paid Advertising' ),
		website_online_store_development: translate( 'Website or Online Store Development' ),
		site_migration_platform_integration: translate( 'Site Migration and Platform Integration' ),
		site_maintenance_platform_integration: translate( 'Site Maintenance & Plugin Management' ),
		website_performance_optimization: translate( 'Website Performance Optimization' ),
		conversion_rate_checkout_optimization: translate( 'Conversion Rate & Checkout Optimization' ),
		ecommerce_consulting: translate( 'eCommerce Consulting' ),
		growth_consulting: translate( 'Growth Consulting' ),
		accessibility_consulting: translate( 'Accessibility Consulting' ),
		security_consulting: translate( 'Security Consulting' ),
		international_multilingual_consulting: translate( 'International and Multilingual Consulting' ),
	};

	const availableProducts: Record< string, string > = {
		wordpress: 'WordPress.com',
		woocommerce: 'WooCommerce',
		jetpack: 'Jetpack',
		wordpress_vip: 'WordPress VIP',
		pressable: 'Pressable',
	};

	const availableDirectories: Record< DirectoryApplicationType, string > = {
		wordpress: 'WordPress.com',
		woocommerce: 'WooCommerce.com',
		jetpack: 'Jetpack.com',
		pressable: 'Pressable.com',
	};

	return {
		availableServices,
		availableLanguages,
		availableProducts,
		availableDirectories,
	};
}
