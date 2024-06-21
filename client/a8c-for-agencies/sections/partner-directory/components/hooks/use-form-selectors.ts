import { useTranslate } from 'i18n-calypso';
import { availableLanguages } from '../../lib/available-languages';
import { DirectoryApplicationType } from '../../types';

export function reverseMap< T >( obj: Record< string, T > ): Record< string, string > {
	return Object.fromEntries( Object.entries( obj ).map( ( [ key, value ] ) => [ value, key ] ) );
}

export function useFormSelectors() {
	const translate = useTranslate();

	const availableServices: Record< string, string > = {
		seo_advertising: translate( 'SEO & Advertising' ),
		email_social_media_marketing: translate( 'Email & social media marketing' ),
		content_marketing: translate( 'Content marketing' ),
		conversion_checkout_optimization: translate( 'Conversion & checkout optimization' ),
		site_optimization: translate( 'Site optimization' ),
		plugin_site_updates: translate( 'Plugin site updates' ),
		store_build_migration: translate( 'Store build & migration' ),
		consulting: translate( 'Consulting' ),
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
