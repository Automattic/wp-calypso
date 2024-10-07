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
		ai_powered_web_applications: translate( 'AI-powered Web Applications' ),
		headless_wordpress_and_woo: translate( 'Headless WordPress & Woo' ),
	};

	// Always sort the industries alphabetically
	const availableIndustries: Record< string, string > = {
		agriculture_and_farming: translate( 'Agriculture & Farming' ),
		arts_and_culture: translate( 'Arts & Culture' ),
		automotive_and_transportation: translate( 'Automotive & Transportation' ),
		construction_and_engineering: translate( 'Construction & Engineering' ),
		education_and_e_learning: translate( 'Education & E-Learning' ),
		e_commerce_and_retail: translate( 'E-commerce & Retail' ),
		energy_and_utilities: translate( 'Energy & Utilities' ),
		entertainment_and_media: translate( 'Entertainment & Media' ),
		environmental_and_sustainability: translate( 'Environmental & Sustainability' ),
		events_and_conferences: translate( 'Events & Conferences' ),
		fashion_and_beauty: translate( 'Fashion & Beauty' ),
		finance_and_insurance: translate( 'Finance & Insurance' ),
		food_and_beverage: translate( 'Food & Beverage' ),
		government_and_public_services: translate( 'Government & Public Services' ),
		healthcare_and_medical: translate( 'Healthcare & Medical' ),
		legal_and_professional_services: translate( 'Legal & Professional Services' ),
		logistics_and_supply_chain: translate( 'Logistics & Supply Chain' ),
		manufacturing_and_industry: translate( 'Manufacturing & Industry' ),
		marketing_and_advertising: translate( 'Marketing & Advertising' ),
		nonprofits_and_ngos: translate( 'Nonprofits & NGOs' ),
		real_estate_and_property: translate( 'Real Estate & Property' ),
		sports_and_recreation: translate( 'Sports & Recreation' ),
		technology_and_it_services: translate( 'Technology & IT Services' ),
		travel_and_hospitality: translate( 'Travel & Hospitality' ),
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
