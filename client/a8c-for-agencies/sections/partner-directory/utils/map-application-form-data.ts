import { Agency } from 'calypso/state/a8c-for-agencies/types';
import {
	AgencyDetails,
	AgencyDirectoryApplication,
	AgencyLeadMatchingProfile,
	LeadMatchingDetails,
} from '../types';

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
	allowedValues.has( value ?? '' ) ? value ?? '' : '';

export function createDefaultLeadMatchingDetails(): LeadMatchingDetails {
	return {
		regions: [],
		supportsGlobal: false,
		languages: [],
		businessTypes: [],
		otherBusinessType: '',
		idealBusinessTypes: [],
		otherIdealBusinessType: '',
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

export function createDefaultLeadMatchingProfile(): AgencyLeadMatchingProfile {
	return {
		availability: {
			accepting_work: false,
			lead_eligibility: 'eligible',
			profile_v2_complete: false,
		},
		geography_and_language: {
			supported_regions: [],
			global_remote: false,
			supported_languages: [],
		},
		business_fit: {
			supported_business_types: [],
			ideal_business_types: [],
			supported_company_sizes: [],
		},
		platform_and_hosting: {
			supported_hosting_environments: [],
			migration_platforms: [],
			can_recommend_better_hosting: false,
		},
		ecommerce: {
			supports_ecommerce_projects: false,
			ecommerce_focus: false,
			supported_complexity_flags: [],
		},
		project_types: {
			supported_project_types: [],
			accepts_small_fixes: false,
		},
		service_and_budget: {
			max_service_level: '',
			supported_budget_bands: [],
			minimum_budget_band: '',
		},
		timing: {
			supported_start_timings: [],
			supports_hard_deadlines: false,
		},
		delivery_model: {
			supported_decision_processes: [],
			offers_care_plans: false,
			trains_clients: false,
			works_with_internal_technical_teams: false,
			requires_maintenance_plan: false,
		},
	};
}

export function mapApplicationFormData( agency: Agency | null ): AgencyDirectoryApplication | null {
	if ( ! agency?.profile?.partner_directory_application ) {
		return null;
	}

	return {
		status: agency.profile.partner_directory_application.status,
		products: agency.profile.listing_details.products ?? [],
		services: agency.profile.listing_details.services ?? [],
		directories: agency.profile.partner_directory_application.directories.map(
			( { status, directory, is_published, urls, note } ) => ( {
				status: status,
				directory: directory,
				isPublished: is_published,
				urls: urls,
				note: note,
			} )
		),
		feedbackUrl: agency.profile.partner_directory_application.feedback_url,
		isPublished: !! agency.profile.partner_directory_application.is_published,
	};
}

export function mapAgencyDetailsFormData( agency: Agency | null ): AgencyDetails | null {
	if ( ! agency?.profile ) {
		return null;
	}

	return {
		name: agency.profile.company_details.name,
		email: agency.profile.company_details.email,
		website: agency.profile.company_details.website,
		bioDescription: agency.profile.company_details.bio_description,
		logoUrl: agency.profile.company_details.logo_url,
		landingPageUrl: agency.profile.company_details.landing_page_url,
		country: agency.profile.company_details.country,
		isAvailable: agency.profile.listing_details.is_available,
		isGlobal: agency.profile.listing_details.is_global,
		industries: agency.profile.listing_details.industries,
		services: agency.profile.listing_details.services,
		products: agency.profile.listing_details.products,
		languagesSpoken: agency.profile.listing_details.languages_spoken ?? [],
		budgetLowerRange: agency.profile.budget_details.budget_lower_range,
	};
}

export function mapLeadMatchingFormData( agency: Agency | null ): LeadMatchingDetails | null {
	return mapLeadMatchingProfileToFormData( agency?.lead_matching?.profile ?? null );
}

export function mapLeadMatchingProfileToFormData(
	profile: AgencyLeadMatchingProfile | null | undefined
): LeadMatchingDetails | null {
	if ( ! profile ) {
		return null;
	}

	return {
		regions: profile.geography_and_language?.supported_regions ?? [],
		supportsGlobal: !! profile.geography_and_language?.global_remote,
		languages: profile.geography_and_language?.supported_languages ?? [],
		businessTypes: normalizeValues(
			profile.business_fit?.supported_business_types,
			ALLOWED_BUSINESS_TYPES
		),
		otherBusinessType: '',
		idealBusinessTypes: normalizeValues(
			profile.business_fit?.ideal_business_types,
			ALLOWED_BUSINESS_TYPES
		),
		otherIdealBusinessType: '',
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

export function mapLeadMatchingDetailsToProfile(
	formData: LeadMatchingDetails,
	previousProfile?: AgencyLeadMatchingProfile | null
): AgencyLeadMatchingProfile {
	const serviceLevel = formData.serviceLevels[ 0 ] ?? '';
	const supportsEcommerceProjects =
		formData.projectTypes.includes( 'new_woocommerce' ) || formData.storeComplexities.length > 0;
	const isComplete =
		formData.regions.length > 0 &&
		formData.languages.length > 0 &&
		formData.businessTypes.length > 0 &&
		formData.idealBusinessTypes.length > 0 &&
		formData.companySizes.length > 0 &&
		formData.projectTypes.length > 0 &&
		formData.serviceLevels.length > 0 &&
		formData.budgetLevels.length > 0 &&
		formData.timingPreferences.length > 0 &&
		formData.decisionProcesses.length > 0 &&
		formData.ongoingRelationships.length > 0;
	let leadEligibility = 'eligible';
	if ( typeof previousProfile?.availability?.lead_eligibility === 'string' ) {
		leadEligibility = previousProfile.availability.lead_eligibility;
	}

	return {
		availability: {
			accepting_work: previousProfile?.availability?.accepting_work ?? true,
			lead_eligibility: leadEligibility,
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
			max_service_level: serviceLevel,
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
