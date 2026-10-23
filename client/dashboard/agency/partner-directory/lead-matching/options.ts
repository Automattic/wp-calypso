import { __ } from '@wordpress/i18n';

/*
 * The lead matching answers, keyed by the slug the API stores. The order is
 * the order the options are offered in, unless the field sorts them.
 */

export const getRegionOptions = (): Record< string, string > => ( {
	americas: __( 'Americas (North, Central, South America)' ),
	emea: __( 'EMEA (Europe, Middle East, Africa)' ),
	apac: __( 'APAC (Asia-Pacific, including Australia/Oceania)' ),
} );

export const getBusinessTypeOptions = (): Record< string, string > => ( {
	local_service: __( 'Local / service businesses' ),
	online_store_physical: __(
		'Online stores – physical products (including brands with retail + online)'
	),
	online_store_digital: __( 'Online stores – digital products / subscriptions only' ),
	content_media: __( 'Content / blog / media' ),
	nonprofit_community: __( 'Non-profit / community' ),
	other: __( 'Other' ),
} );

export const getCompanySizeOptions = (): Record< string, string > => ( {
	size_1_5: __( '1–5: Small teams needing hands-on help and simple processes' ),
	size_6_50: __( '6–50: Small businesses wanting cost-efficient support and execution' ),
	size_51_250: __( '51–250: Mid-size orgs with multiple stakeholders and reporting needs' ),
	size_251_1000: __(
		'251–1,000: Mid-market companies with defined processes and cross-functional teams'
	),
	size_1000_plus: __(
		'1,000+: Enterprise with complex systems, approvals, and structured workflows'
	),
} );

export const getHostingEnvironmentOptions = (): Record< string, string > => ( {
	wpcom: 'WordPress.com',
	shared_managed: __( 'Common shared / managed hosting (SiteGround, Bluehost, GoDaddy, etc.)' ),
	managed_wp_hosts: __( 'Managed WordPress hosts (Pressable, WP Engine, Kinsta, etc.)' ),
	self_hosted: __( 'Self-hosted / custom hosting' ),
} );

export const getMigrationPlatformOptions = (): Record< string, string > => ( {
	shopify: 'Shopify',
	wix: 'Wix',
	squarespace: 'Squarespace',
	webflow: 'Webflow',
	custom: __( 'Other website builders / e-commerce platforms / custom platforms' ),
} );

export const getStoreComplexityOptions = (): Record< string, string > => ( {
	custom_pricing: __( 'Custom pricing or catalogs (e.g., by customer type or region)' ),
	erp_integrations: __( 'ERP, inventory, or pricing integrations' ),
	customer_portals: __( 'Customer portals or gated access' ),
	subscriptions_memberships: __( 'Subscriptions or memberships' ),
	traffic_spikes: __( 'Traffic spikes (e.g., product drops, seasonal events)' ),
	none_simple: __( 'None of the above / Simple catalog' ),
} );

export const getProjectTypeOptions = (): Record< string, string > => ( {
	new_website: __( 'Create new WordPress websites (from scratch or moving from another platform)' ),
	redesign: __( 'Improve or redesign existing WordPress / WooCommerce sites' ),
	new_woocommerce: __( 'Set up new WooCommerce online stores' ),
	migration: __( 'Migrate sites or stores to WordPress / WooCommerce' ),
	fix_ongoing_support: __( 'Fix problems / maintenance / ongoing support' ),
	performance_optimization: __( 'Performance / speed optimization' ),
	custom_features: __(
		'Custom features (e.g. custom checkout, memberships, integrations with other tools)'
	),
	seo_marketing: __( 'SEO and marketing support' ),
	security_audit: __( 'Security audits and hardening' ),
	accessibility: __( 'Accessibility improvements and audits' ),
} );

export const getServiceLevelOptions = (): Record< string, string > => ( {
	essential: __( 'Essential: simple websites/stores with core features' ),
	enhanced: __( 'Enhanced: improved design/experience with some tailored features' ),
	premium: __( 'Premium: highly customized design and complex features/integrations' ),
} );

export const getBudgetLevelOptions = (): Record< string, string > => ( {
	affordable: __( 'Most “affordable” client types' ),
	mid_range: __( 'Most “mid-range” client types' ),
	premium: __( 'Most “premium” client types' ),
} );

export const getMinimumBudgetOptions = (): Record< string, string > => ( {
	under_3k: __( '$3,000 and below' ),
	'3k_10k': __( '$3,000–$10,000' ),
	'10k_30k': __( '$10,000–$30,000' ),
	above_30k: __( 'Above $30,000' ),
} );

export const getTimingPreferenceOptions = (): Record< string, string > => ( {
	right_away: __( 'Can start right away for some projects' ),
	within_month: __( 'Prefer to start within the next month' ),
	book_1_3_months: __( 'Prefer to book 1–3 months in advance' ),
	flexible: __( 'Flexible / depends on project size' ),
} );

export const getDecisionProcessOptions = (): Record< string, string > => ( {
	individual: __( 'Individual decision-makers' ),
	small_team: __( 'Small team decisions (2–3 people)' ),
	multi_stakeholder: __( 'Multi-stakeholder processes across departments' ),
	formal_procurement: __( 'Formal procurement / enterprise purchasing' ),
} );

export const getOngoingRelationshipOptions = (): Record< string, string > => ( {
	care_plans: __( 'We provide ongoing care plans and handle most website tasks for clients' ),
	training: __( 'We are happy to train clients so they can manage simple changes themselves' ),
	technical_teams: __( 'We work well with internal technical teams / developers' ),
} );
