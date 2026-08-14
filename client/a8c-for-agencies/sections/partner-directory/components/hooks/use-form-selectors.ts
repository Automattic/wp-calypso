import { useTranslate } from 'i18n-calypso';
import { availableLanguages } from '../../lib/available-languages';

export function reverseMap< T >( obj: Record< string, T > ): Record< string, string > {
	return Object.fromEntries( Object.entries( obj ).map( ( [ key, value ] ) => [ value, key ] ) );
}

export function useFormSelectors() {
	const translate = useTranslate();

	const availableRegions: Record< string, string > = {
		americas: translate( 'Americas (North, Central, South America)' ),
		emea: translate( 'EMEA (Europe, Middle East, Africa)' ),
		apac: translate( 'APAC (Asia-Pacific, including Australia/Oceania)' ),
	};

	const availableBusinessTypes: Record< string, string > = {
		local_service: translate( 'Local / service businesses' ),
		online_store_physical: translate(
			'Online stores – physical products (including brands with retail + online)'
		),
		online_store_digital: translate( 'Online stores – digital products / subscriptions only' ),
		content_media: translate( 'Content / blog / media' ),
		nonprofit_community: translate( 'Non-profit / community' ),
		other: translate( 'Other' ),
	};

	const availableCompanySizes: Record< string, string > = {
		size_1_5: translate( '1–5: Small teams needing hands-on help and simple processes' ),
		size_6_50: translate( '6–50: Small businesses wanting cost-efficient support and execution' ),
		size_51_250: translate(
			'51–250: Mid-size orgs with multiple stakeholders and reporting needs'
		),
		size_251_1000: translate(
			'251–1,000: Mid-market companies with defined processes and cross-functional teams'
		),
		size_1000_plus: translate(
			'1,000+: Enterprise with complex systems, approvals, and structured workflows'
		),
	};

	const availableHostingEnvironments: Record< string, string > = {
		wpcom: 'WordPress.com',
		shared_managed: translate(
			'Common shared / managed hosting (SiteGround, Bluehost, GoDaddy, etc.)'
		),
		managed_wp_hosts: translate( 'Managed WordPress hosts (Pressable, WP Engine, Kinsta, etc.)' ),
		self_hosted: translate( 'Self-hosted / custom hosting' ),
	};

	const availableMigrationPlatforms: Record< string, string > = {
		shopify: 'Shopify',
		wix: 'Wix',
		squarespace: 'Squarespace',
		webflow: 'Webflow',
		custom: translate( 'Other website builders / e-commerce platforms / custom platforms' ),
	};

	const availableStoreComplexities: Record< string, string > = {
		custom_pricing: translate( 'Custom pricing or catalogs (e.g., by customer type or region)' ),
		erp_integrations: translate( 'ERP, inventory, or pricing integrations' ),
		customer_portals: translate( 'Customer portals or gated access' ),
		subscriptions_memberships: translate( 'Subscriptions or memberships' ),
		traffic_spikes: translate( 'Traffic spikes (e.g., product drops, seasonal events)' ),
		none_simple: translate( 'None of the above / Simple catalog' ),
	};

	const availableProjectTypes: Record< string, string > = {
		new_website: translate(
			'Create new WordPress websites (from scratch or moving from another platform)'
		),
		redesign: translate( 'Improve or redesign existing WordPress / WooCommerce sites' ),
		new_woocommerce: translate( 'Set up new WooCommerce online stores' ),
		migration: translate( 'Migrate sites or stores to WordPress / WooCommerce' ),
		fix_ongoing_support: translate( 'Fix problems / maintenance / ongoing support' ),
		performance_optimization: translate( 'Performance / speed optimization' ),
		custom_features: translate(
			'Custom features (e.g. custom checkout, memberships, integrations with other tools)'
		),
		seo_marketing: translate( 'SEO and marketing support' ),
		security_audit: translate( 'Security audits and hardening' ),
		accessibility: translate( 'Accessibility improvements and audits' ),
	};

	const availableServiceLevels: Record< string, string > = {
		essential: translate( 'Essential: simple websites/stores with core features' ),
		enhanced: translate( 'Enhanced: improved design/experience with some tailored features' ),
		premium: translate( 'Premium: highly customized design and complex features/integrations' ),
	};

	const availableTimingPreferences: Record< string, string > = {
		right_away: translate( 'Can start right away for some projects' ),
		within_month: translate( 'Prefer to start within the next month' ),
		book_1_3_months: translate( 'Prefer to book 1–3 months in advance' ),
		flexible: translate( 'Flexible / depends on project size' ),
	};

	const availableDecisionProcesses: Record< string, string > = {
		individual: translate( 'Individual decision-makers' ),
		small_team: translate( 'Small team decisions (2–3 people)' ),
		multi_stakeholder: translate( 'Multi-stakeholder processes across departments' ),
		formal_procurement: translate( 'Formal procurement / enterprise purchasing' ),
	};

	const availableOngoingRelationships: Record< string, string > = {
		care_plans: translate(
			'We provide ongoing care plans and handle most website tasks for clients'
		),
		training: translate(
			'We are happy to train clients so they can manage simple changes themselves'
		),
		technical_teams: translate( 'We work well with internal technical teams / developers' ),
	};

	const availableBudgetLevels: Record< string, string > = {
		affordable: translate( 'Most "affordable" client types' ),
		mid_range: translate( 'Most "mid-range" client types' ),
		premium: translate( 'Most "premium" client types' ),
	};

	const availableMinimumBudgets: Record< string, string > = {
		under_3k: translate( '$3,000 and below' ),
		'3k_10k': translate( '$3,000–$10,000' ),
		'10k_30k': translate( '$10,000–$30,000' ),
		above_30k: translate( 'Above $30,000' ),
	};

	return {
		availableLanguages,
		availableRegions,
		availableBusinessTypes,
		availableCompanySizes,
		availableHostingEnvironments,
		availableMigrationPlatforms,
		availableStoreComplexities,
		availableProjectTypes,
		availableServiceLevels,
		availableTimingPreferences,
		availableDecisionProcesses,
		availableOngoingRelationships,
		availableBudgetLevels,
		availableMinimumBudgets,
	};
}
