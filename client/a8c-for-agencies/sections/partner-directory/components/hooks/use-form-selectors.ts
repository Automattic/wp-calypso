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

	const availableIndustries: Record< string, string > = {
		technology_and_it_services: translate( 'Technology & IT Services' ),
		e_commerce_and_retail: translate( 'E-commerce & Retail' ),
		finance_and_insurance: translate( 'Finance & Insurance' ),
		healthcare_and_medical: translate( 'Healthcare & Medical' ),
		education_and_e_learning: translate( 'Education & E-Learning' ),
		real_estate_and_property: translate( 'Real Estate & Property' ),
		travel_and_hospitality: translate( 'Travel & Hospitality' ),
		nonprofits_and_ngos: translate( 'Nonprofits & NGOs' ),
		legal_and_professional_services: translate( 'Legal & Professional Services' ),
		entertainment_and_media: translate( 'Entertainment & Media' ),
		construction_and_engineering: translate( 'Construction & Engineering' ),
		automotive_and_transportation: translate( 'Automotive & Transportation' ),
		government_and_public_services: translate( 'Government & Public Services' ),
		marketing_and_advertising: translate( 'Marketing & Advertising' ),
		food_and_beverage: translate( 'Food & Beverage' ),
		manufacturing_and_industry: translate( 'Manufacturing & Industry' ),
		energy_and_utilities: translate( 'Energy & Utilities' ),
		sports_and_recreation: translate( 'Sports & Recreation' ),
		agriculture_and_farming: translate( 'Agriculture & Farming' ),
		arts_and_culture: translate( 'Arts & Culture' ),
		environmental_and_sustainability: translate( 'Environmental & Sustainability' ),
		fashion_and_beauty: translate( 'Fashion & Beauty' ),
		logistics_and_supply_chain: translate( 'Logistics & Supply Chain' ),
		events_and_conferences: translate( 'Events & Conferences' ),
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

	const oldIndustries: Record< string, string > = {
		agricultural_services: 'agriculture_and_farming',
		business_services: 'legal_and_professional_services',
		clothing_shops: 'fashion_and_beauty',
		contracted_services: 'legal_and_professional_services',
		government_services: 'government_and_public_services',
		miscellaneous_shops: 'e_commerce_and_retail',
		professional_services_and_membership_organisations: 'legal_and_professional_services',
		retail_outlet_services: 'e_commerce_and_retail',
		transportation_services: 'automotive_and_transportation',
		utility_services: 'energy_and_utilities',
	};

	return {
		availableServices,
		availableLanguages,
		availableProducts,
		availableDirectories,
		availableIndustries: Object.fromEntries( Object.entries( availableIndustries ).sort() ),
		oldIndustries,
	};
}
