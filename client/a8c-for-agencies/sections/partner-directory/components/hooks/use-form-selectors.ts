import { useTranslate } from 'i18n-calypso';
import { availableLanguages } from '../../lib/available-languages';

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
		ecommerce_consulting: translate( 'eCommerce consulting' ),
		growth_consultation: translate( 'Growth consultation' ),
		accessibility_audit: translate( 'Accessibility audit' ),
		security_audit: translate( 'Security audit' ),
		cross_border_multilingual_consultation: translate( 'Cross Border / Multilingual Consultation' ),
	};

	const availableProducts: Record< string, string > = {
		wordpress: 'WordPress',
		woocommerce: 'WooCommerce',
		jetpack: 'Jetpack',
		wordpress_vip: 'WordPress VIP',
		pressable: 'Pressable',
	};

	return {
		availableServices,
		availableLanguages,
		availableProducts,
	};
}
