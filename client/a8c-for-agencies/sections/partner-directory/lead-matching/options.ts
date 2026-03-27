import { __ } from '@wordpress/i18n';

export type LeadMatchingOption = {
	label: string;
	value: string;
};

export function getLeadMatchingOptions() {
	return {
		supportedRegions: [
			{ label: __( 'Americas' ), value: 'americas' },
			{ label: __( 'EMEA' ), value: 'emea' },
			{ label: __( 'APAC' ), value: 'apac' },
		] satisfies LeadMatchingOption[],
		supportedLanguages: [
			{ label: __( 'English' ), value: 'en' },
			{ label: __( 'Spanish' ), value: 'es' },
			{ label: __( 'French' ), value: 'fr' },
			{ label: __( 'German' ), value: 'de' },
			{ label: __( 'Portuguese' ), value: 'pt' },
			{ label: __( 'Italian' ), value: 'it' },
			{ label: __( 'Dutch' ), value: 'nl' },
			{ label: __( 'Japanese' ), value: 'ja' },
			{ label: __( 'Chinese' ), value: 'zh' },
			{ label: __( 'Korean' ), value: 'ko' },
			{ label: __( 'Arabic' ), value: 'ar' },
			{ label: __( 'Hindi' ), value: 'hi' },
		] satisfies LeadMatchingOption[],
		supportedBusinessTypes: [
			{ label: __( 'Local service businesses' ), value: 'local_service' },
			{
				label: __( 'Online stores with physical products' ),
				value: 'online_store_physical',
			},
			{ label: __( 'Online stores with digital products' ), value: 'online_store_digital' },
			{ label: __( 'Content and media' ), value: 'content_media' },
			{ label: __( 'Nonprofits and communities' ), value: 'nonprofit_community' },
			{ label: __( 'Other businesses' ), value: 'other' },
		] satisfies LeadMatchingOption[],
		supportedCompanySizes: [
			{ label: __( '1–5 employees' ), value: 'size_1_5' },
			{ label: __( '6–50 employees' ), value: 'size_6_50' },
			{ label: __( '51–250 employees' ), value: 'size_51_250' },
			{ label: __( '251–1000 employees' ), value: 'size_251_1000' },
			{ label: __( '1000+ employees' ), value: 'size_1000_plus' },
		] satisfies LeadMatchingOption[],
		supportedHostingEnvironments: [
			{ label: __( 'WordPress.com' ), value: 'wordpress_com' },
			{ label: __( 'Shared or managed hosting' ), value: 'shared_or_managed_host' },
			{ label: __( 'Managed WordPress hosting' ), value: 'managed_wp_host' },
			{ label: __( 'Unknown or not sure' ), value: 'unknown' },
		] satisfies LeadMatchingOption[],
		migrationPlatforms: [
			{ label: __( 'WordPress' ), value: 'wordpress' },
			{ label: __( 'WooCommerce' ), value: 'woocommerce' },
			{ label: __( 'Shopify' ), value: 'shopify' },
			{ label: __( 'Wix' ), value: 'wix' },
			{ label: __( 'Squarespace' ), value: 'squarespace' },
			{ label: __( 'Webflow' ), value: 'webflow' },
			{ label: __( 'Custom platform' ), value: 'custom' },
			{ label: __( 'Other platform' ), value: 'other' },
		] satisfies LeadMatchingOption[],
		supportedComplexityFlags: [
			{ label: __( 'Custom pricing or catalogs' ), value: 'custom_pricing_catalogs' },
			{
				label: __( 'ERP, inventory, or pricing integrations' ),
				value: 'erp_inventory_pricing_integrations',
			},
			{
				label: __( 'Customer portals or gated access' ),
				value: 'customer_portals_gated_access',
			},
			{ label: __( 'Subscriptions or memberships' ), value: 'subscriptions_memberships' },
			{ label: __( 'Traffic spikes' ), value: 'traffic_spikes' },
			{ label: __( 'Simple catalog' ), value: 'simple_catalog' },
		] satisfies LeadMatchingOption[],
		supportedProjectTypes: [
			{ label: __( 'New WordPress site' ), value: 'new_wordpress_site' },
			{ label: __( 'New WooCommerce store' ), value: 'new_woocommerce_store' },
			{ label: __( 'Improve or redesign' ), value: 'improve_or_redesign' },
			{ label: __( 'Support and fixes' ), value: 'support_and_fixes' },
			{ label: __( 'Performance optimization' ), value: 'performance_optimization' },
			{ label: __( 'Custom features' ), value: 'custom_features' },
		] satisfies LeadMatchingOption[],
		supportedBudgetBands: [
			{ label: __( 'Affordable' ), value: 'affordable' },
			{ label: __( 'Mid-range' ), value: 'mid_range' },
			{ label: __( 'Premium' ), value: 'premium' },
		] satisfies LeadMatchingOption[],
		supportedStartTimings: [
			{ label: __( 'Right away' ), value: 'right_away' },
			{ label: __( 'Within a month' ), value: 'within_month' },
			{ label: __( 'Planning in 1–3 months' ), value: 'planning_1_3_months' },
			{ label: __( 'Flexible timing' ), value: 'flexible' },
		] satisfies LeadMatchingOption[],
		supportedDecisionProcesses: [
			{ label: __( 'Solo decider' ), value: 'solo_decider' },
			{ label: __( 'Small team' ), value: 'small_team' },
			{ label: __( 'Multiple stakeholders' ), value: 'multi_stakeholder' },
			{
				label: __( 'Procurement or formal approval' ),
				value: 'procurement_or_formal_approval',
			},
		] satisfies LeadMatchingOption[],
		maxServiceLevels: [
			{ label: __( 'Select a maximum service level' ), value: '' },
			{ label: __( 'Essential' ), value: 'essential' },
			{ label: __( 'Enhanced' ), value: 'enhanced' },
			{ label: __( 'Premium' ), value: 'premium' },
		] satisfies LeadMatchingOption[],
		minimumBudgetBands: [
			{ label: __( 'Select a minimum budget' ), value: '' },
			{ label: __( 'Under $3k' ), value: 'under_3k' },
			{ label: __( '$3k-$10k' ), value: '3k_10k' },
			{ label: __( '$10k-$30k' ), value: '10k_30k' },
			{ label: __( '$30k+' ), value: '30k_plus' },
		] satisfies LeadMatchingOption[],
	};
}
