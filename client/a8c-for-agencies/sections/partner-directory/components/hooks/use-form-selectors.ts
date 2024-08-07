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

	const availableIndustries: Record< string, string > = {
		agricultural_services: translate( 'Agricultural services' ),
		business_services: translate( 'Business services' ),
		clothing_shops: translate( 'Clothing shops' ),
		contracted_services: translate( 'Contracted services' ),
		government_services: translate( 'Government services' ),
		miscellaneous_shops: translate( 'Miscellaneous shops' ),
		professional_services_and_membership_organisations: translate(
			'Professional services and membership organisations'
		),
		retail_outlet_services: translate( 'Retail outlet services' ),
		transportation_services: translate( 'Transportation services' ),
		utility_services: translate( 'Utility services' ),
	};

	const availableProducts: Record< string, string > = {
		wordpress_com: 'WordPress.com',
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
		availableIndustries,
	};
}
