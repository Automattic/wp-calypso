import type { AgencyLeadMatchingProfile } from '@automattic/api-core';

export interface LeadMatchingFormData {
	regions: string[];
	supportsGlobal: boolean;
	languages: string[];
	businessTypes: string[];
	idealBusinessTypes: string[];
	companySizes: string[];
	hostingEnvironments: string[];
	supportsHostingRecommendation: boolean;
	migrationPlatforms: string[];
	storeComplexities: string[];
	projectTypes: string[];
	supportsQuickHelp: boolean;
	// A single choice, kept as a list like the other answers.
	serviceLevels: string[];
	budgetLevels: string[];
	minimumBudget: string;
	timingPreferences: string[];
	supportsHardDeadlines: boolean;
	decisionProcesses: string[];
	ongoingRelationships: string[];
	requiresMaintenance: boolean;
}

/**
 * The answers every agency has to give to be matched with leads.
 */
export const REQUIRED_LEAD_MATCHING_FIELDS = [
	'regions',
	'languages',
	'businessTypes',
	'idealBusinessTypes',
	'companySizes',
	'projectTypes',
	'serviceLevels',
	'budgetLevels',
	'timingPreferences',
	'decisionProcesses',
	'ongoingRelationships',
] as const satisfies readonly ( keyof LeadMatchingFormData )[];

export type RequiredLeadMatchingField = ( typeof REQUIRED_LEAD_MATCHING_FIELDS )[ number ];

const ALLOWED_BUSINESS_TYPES = new Set( [
	'local_service',
	'online_store_physical',
	'online_store_digital',
	'content_media',
	'nonprofit_community',
	'other',
] );

const ALLOWED_HOSTING_ENVIRONMENTS = new Set( [
	'wpcom',
	'shared_managed',
	'managed_wp_hosts',
	'self_hosted',
] );

const ALLOWED_MIGRATION_PLATFORMS = new Set( [
	'shopify',
	'wix',
	'squarespace',
	'webflow',
	'custom',
] );

const ALLOWED_COMPLEXITY_FLAGS = new Set( [
	'custom_pricing',
	'erp_integrations',
	'customer_portals',
	'subscriptions_memberships',
	'traffic_spikes',
	'none_simple',
] );

const ALLOWED_PROJECT_TYPES = new Set( [
	'new_website',
	'redesign',
	'new_woocommerce',
	'migration',
	'custom_features',
	'fix_ongoing_support',
	'seo_marketing',
	'performance_optimization',
	'security_audit',
	'accessibility',
] );

const ALLOWED_DECISION_PROCESSES = new Set( [
	'individual',
	'small_team',
	'multi_stakeholder',
	'formal_procurement',
] );

const ALLOWED_BUDGET_LEVELS = new Set( [ 'affordable', 'mid_range', 'premium' ] );

const ALLOWED_MINIMUM_BUDGETS = new Set( [ 'under_3k', '3k_10k', '10k_30k', 'above_30k' ] );

const ALLOWED_TIMING_PREFERENCES = new Set( [
	'right_away',
	'within_month',
	'book_1_3_months',
	'flexible',
] );

const normalizeValues = ( values: string[] | undefined, allowedValues: Set< string > ) =>
	Array.from( new Set( ( values ?? [] ).filter( ( value ) => allowedValues.has( value ) ) ) );

const normalizeOptionalValue = ( value: string | undefined, allowedValues: Set< string > ) =>
	allowedValues.has( value ?? '' ) ? ( value ?? '' ) : '';

export function getEmptyLeadMatchingFormData(): LeadMatchingFormData {
	return {
		regions: [],
		supportsGlobal: false,
		languages: [],
		businessTypes: [],
		idealBusinessTypes: [],
		companySizes: [],
		hostingEnvironments: [],
		supportsHostingRecommendation: false,
		migrationPlatforms: [],
		storeComplexities: [],
		projectTypes: [],
		supportsQuickHelp: false,
		serviceLevels: [],
		budgetLevels: [],
		minimumBudget: '',
		timingPreferences: [],
		supportsHardDeadlines: false,
		decisionProcesses: [],
		ongoingRelationships: [],
		requiresMaintenance: false,
	};
}

/**
 * The saved profile as form data. Unknown answers are dropped for the fields
 * with a closed list of options; regions, languages and company sizes are
 * kept as stored.
 */
export function getLeadMatchingFormData(
	profile?: AgencyLeadMatchingProfile | null
): LeadMatchingFormData {
	if ( ! profile ) {
		return getEmptyLeadMatchingFormData();
	}

	return {
		regions: profile.geography_and_language?.supported_regions ?? [],
		supportsGlobal: !! profile.geography_and_language?.global_remote,
		languages: profile.geography_and_language?.supported_languages ?? [],
		businessTypes: normalizeValues(
			profile.business_fit?.supported_business_types,
			ALLOWED_BUSINESS_TYPES
		),
		idealBusinessTypes: normalizeValues(
			profile.business_fit?.ideal_business_types,
			ALLOWED_BUSINESS_TYPES
		),
		companySizes: profile.business_fit?.supported_company_sizes ?? [],
		hostingEnvironments: normalizeValues(
			profile.platform_and_hosting?.supported_hosting_environments,
			ALLOWED_HOSTING_ENVIRONMENTS
		),
		supportsHostingRecommendation: !! profile.platform_and_hosting?.can_recommend_better_hosting,
		migrationPlatforms: normalizeValues(
			profile.platform_and_hosting?.migration_platforms,
			ALLOWED_MIGRATION_PLATFORMS
		),
		storeComplexities: normalizeValues(
			profile.ecommerce?.supported_complexity_flags,
			ALLOWED_COMPLEXITY_FLAGS
		),
		projectTypes: normalizeValues(
			profile.project_types?.supported_project_types,
			ALLOWED_PROJECT_TYPES
		),
		supportsQuickHelp: !! profile.project_types?.accepts_small_fixes,
		serviceLevels: profile.service_and_budget?.max_service_level
			? [ profile.service_and_budget.max_service_level ]
			: [],
		budgetLevels: normalizeValues(
			profile.service_and_budget?.supported_budget_bands,
			ALLOWED_BUDGET_LEVELS
		),
		minimumBudget: normalizeOptionalValue(
			profile.service_and_budget?.minimum_budget_band,
			ALLOWED_MINIMUM_BUDGETS
		),
		timingPreferences: normalizeValues(
			profile.timing?.supported_start_timings,
			ALLOWED_TIMING_PREFERENCES
		),
		supportsHardDeadlines: !! profile.timing?.supports_hard_deadlines,
		decisionProcesses: normalizeValues(
			profile.delivery_model?.supported_decision_processes,
			ALLOWED_DECISION_PROCESSES
		),
		ongoingRelationships: [
			...( profile.delivery_model?.offers_care_plans ? [ 'care_plans' ] : [] ),
			...( profile.delivery_model?.trains_clients ? [ 'training' ] : [] ),
			...( profile.delivery_model?.works_with_internal_technical_teams
				? [ 'technical_teams' ]
				: [] ),
		],
		requiresMaintenance: !! profile.delivery_model?.requires_maintenance_plan,
	};
}

export function getAnsweredRequiredFieldCount( formData: LeadMatchingFormData ): number {
	return REQUIRED_LEAD_MATCHING_FIELDS.filter( ( field ) => formData[ field ].length > 0 ).length;
}

/**
 * The form data as the profile the API stores. The eligibility fields the
 * form doesn't edit are carried over from the saved profile.
 */
export function getLeadMatchingProfile(
	formData: LeadMatchingFormData,
	previousProfile: AgencyLeadMatchingProfile | null | undefined,
	acceptingWork: boolean
): AgencyLeadMatchingProfile {
	const supportsEcommerceProjects =
		formData.projectTypes.includes( 'new_woocommerce' ) || formData.storeComplexities.length > 0;
	const isComplete =
		getAnsweredRequiredFieldCount( formData ) === REQUIRED_LEAD_MATCHING_FIELDS.length;

	return {
		availability: {
			accepting_work: acceptingWork,
			lead_eligibility:
				typeof previousProfile?.availability?.lead_eligibility === 'string'
					? previousProfile.availability.lead_eligibility
					: 'eligible',
			profile_v2_complete: previousProfile?.availability?.profile_v2_complete ?? isComplete,
		},
		geography_and_language: {
			supported_regions: formData.regions,
			global_remote: formData.supportsGlobal,
			supported_languages: formData.languages,
		},
		business_fit: {
			supported_business_types: normalizeValues( formData.businessTypes, ALLOWED_BUSINESS_TYPES ),
			ideal_business_types: normalizeValues( formData.idealBusinessTypes, ALLOWED_BUSINESS_TYPES ),
			supported_company_sizes: formData.companySizes,
		},
		platform_and_hosting: {
			supported_hosting_environments: formData.hostingEnvironments,
			migration_platforms: formData.migrationPlatforms,
			can_recommend_better_hosting: formData.supportsHostingRecommendation,
		},
		ecommerce: {
			supports_ecommerce_projects: supportsEcommerceProjects,
			ecommerce_focus: supportsEcommerceProjects && formData.storeComplexities.length > 0,
			supported_complexity_flags: normalizeValues(
				formData.storeComplexities,
				ALLOWED_COMPLEXITY_FLAGS
			),
		},
		project_types: {
			supported_project_types: formData.projectTypes,
			accepts_small_fixes: formData.supportsQuickHelp,
		},
		service_and_budget: {
			max_service_level: formData.serviceLevels[ 0 ] ?? '',
			supported_budget_bands: formData.budgetLevels,
			minimum_budget_band: normalizeOptionalValue(
				formData.minimumBudget,
				ALLOWED_MINIMUM_BUDGETS
			),
		},
		timing: {
			supported_start_timings: formData.timingPreferences,
			supports_hard_deadlines: formData.supportsHardDeadlines,
		},
		delivery_model: {
			supported_decision_processes: formData.decisionProcesses,
			offers_care_plans: formData.ongoingRelationships.includes( 'care_plans' ),
			trains_clients: formData.ongoingRelationships.includes( 'training' ),
			works_with_internal_technical_teams:
				formData.ongoingRelationships.includes( 'technical_teams' ),
			requires_maintenance_plan: formData.requiresMaintenance,
		},
	};
}
