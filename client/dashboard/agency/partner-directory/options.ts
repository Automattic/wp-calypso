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

/**
 * The industries an agency can serve, keyed by the slug the API stores.
 */
export const getAvailableIndustries = (): Record< string, string > => ( {
	agriculture_and_farming: __( 'Agriculture & Farming' ),
	arts_and_culture: __( 'Arts & Culture' ),
	automotive_and_transportation: __( 'Automotive & Transportation' ),
	construction_and_engineering: __( 'Construction & Engineering' ),
	education_and_e_learning: __( 'Education & E-Learning' ),
	e_commerce_and_retail: __( 'E-commerce & Retail' ),
	energy_and_utilities: __( 'Energy & Utilities' ),
	entertainment_and_media: __( 'Entertainment & Media' ),
	environmental_and_sustainability: __( 'Environmental & Sustainability' ),
	events_and_conferences: __( 'Events & Conferences' ),
	fashion_and_beauty: __( 'Fashion & Beauty' ),
	finance_and_insurance: __( 'Finance & Insurance' ),
	food_and_beverage: __( 'Food & Beverage' ),
	government_and_public_services: __( 'Government & Public Services' ),
	healthcare_and_medical: __( 'Healthcare & Medical' ),
	legal_and_professional_services: __( 'Legal & Professional Services' ),
	logistics_and_supply_chain: __( 'Logistics & Supply Chain' ),
	manufacturing_and_industry: __( 'Manufacturing & Industry' ),
	marketing_and_advertising: __( 'Marketing & Advertising' ),
	nonprofits_and_ngos: __( 'Nonprofits & NGOs' ),
	real_estate_and_property: __( 'Real Estate & Property' ),
	sports_and_recreation: __( 'Sports & Recreation' ),
	technology_and_it_services: __( 'Technology & IT Services' ),
	travel_and_hospitality: __( 'Travel & Hospitality' ),
} );

/**
 * Retired industry slugs an agency may still have stored, mapped to their
 * current replacements.
 */
export const OLD_INDUSTRIES: Record< string, string > = {
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

/**
 * The languages an agency can list, keyed by the ISO code the API stores.
 */
export const getAvailableLanguages = (): Record< string, string > => ( {
	en: __( 'English' ),
	es: __( 'Spanish' ),
	fr: __( 'French' ),
	de: __( 'German' ),
	pt: __( 'Portuguese' ),
	it: __( 'Italian' ),
	nl: __( 'Dutch' ),
	ja: __( 'Japanese' ),
	zh: __( 'Chinese' ),
	ko: __( 'Korean' ),
	ar: __( 'Arabic' ),
	hi: __( 'Hindi' ),
} );

/**
 * The minimum project budget options, as USD amounts the API stores.
 */
export const BUDGET_LOWER_RANGES = [ '0', '500', '5000', '10000', '20000', '30000', '45000' ];
