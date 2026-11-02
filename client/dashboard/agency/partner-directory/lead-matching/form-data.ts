import { normalizeAgencyBookingLink } from '@automattic/api-core';
import { normalizePhoneNumber } from '@automattic/js-utils';
import {
	getBudgetLevelOptions,
	getBusinessTypeOptions,
	getDecisionProcessOptions,
	getHostingEnvironmentOptions,
	getMigrationPlatformOptions,
	getMinimumBudgetOptions,
	getProjectTypeOptions,
	getStoreComplexityOptions,
	getTimingPreferenceOptions,
} from './options';
import type { AgencyLeadMatchingProfile } from '@automattic/api-core';

export interface LeadMatchingFormData {
	phoneNumber: string;
	phoneCountryCode: string;
	bookingLink: string;
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

// The answers an option list offers; anything else is dropped when read or saved.
const optionKeys = ( options: Record< string, string > ) => new Set( Object.keys( options ) );

const normalizeValues = ( values: string[] | undefined, allowedValues: Set< string > ) =>
	Array.from( new Set( ( values ?? [] ).filter( ( value ) => allowedValues.has( value ) ) ) );

const normalizeOptionalValue = ( value: string | undefined, allowedValues: Set< string > ) =>
	allowedValues.has( value ?? '' ) ? ( value ?? '' ) : '';

export function getEmptyLeadMatchingFormData(): LeadMatchingFormData {
	return {
		phoneNumber: '',
		phoneCountryCode: '',
		bookingLink: '',
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
		phoneNumber: profile.contact?.phone ?? '',
		phoneCountryCode: '',
		bookingLink: profile.contact?.booking_link ?? '',
		regions: profile.geography_and_language?.supported_regions ?? [],
		supportsGlobal: !! profile.geography_and_language?.global_remote,
		languages: profile.geography_and_language?.supported_languages ?? [],
		businessTypes: normalizeValues(
			profile.business_fit?.supported_business_types,
			optionKeys( getBusinessTypeOptions() )
		),
		idealBusinessTypes: normalizeValues(
			profile.business_fit?.ideal_business_types,
			optionKeys( getBusinessTypeOptions() )
		),
		companySizes: profile.business_fit?.supported_company_sizes ?? [],
		hostingEnvironments: normalizeValues(
			profile.platform_and_hosting?.supported_hosting_environments,
			optionKeys( getHostingEnvironmentOptions() )
		),
		supportsHostingRecommendation: !! profile.platform_and_hosting?.can_recommend_better_hosting,
		migrationPlatforms: normalizeValues(
			profile.platform_and_hosting?.migration_platforms,
			optionKeys( getMigrationPlatformOptions() )
		),
		storeComplexities: normalizeValues(
			profile.ecommerce?.supported_complexity_flags,
			optionKeys( getStoreComplexityOptions() )
		),
		projectTypes: normalizeValues(
			profile.project_types?.supported_project_types,
			optionKeys( getProjectTypeOptions() )
		),
		supportsQuickHelp: !! profile.project_types?.accepts_small_fixes,
		serviceLevels: profile.service_and_budget?.max_service_level
			? [ profile.service_and_budget.max_service_level ]
			: [],
		budgetLevels: normalizeValues(
			profile.service_and_budget?.supported_budget_bands,
			optionKeys( getBudgetLevelOptions() )
		),
		minimumBudget: normalizeOptionalValue(
			profile.service_and_budget?.minimum_budget_band,
			optionKeys( getMinimumBudgetOptions() )
		),
		timingPreferences: normalizeValues(
			profile.timing?.supported_start_timings,
			optionKeys( getTimingPreferenceOptions() )
		),
		supportsHardDeadlines: !! profile.timing?.supports_hard_deadlines,
		decisionProcesses: normalizeValues(
			profile.delivery_model?.supported_decision_processes,
			optionKeys( getDecisionProcessOptions() )
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
	const contact = {
		phone:
			normalizePhoneNumber( formData.phoneNumber, formData.phoneCountryCode ) ??
			formData.phoneNumber,
		booking_link: normalizeAgencyBookingLink( formData.bookingLink ),
	};
	const supportsEcommerceProjects =
		formData.projectTypes.includes( 'new_woocommerce' ) || formData.storeComplexities.length > 0;
	const isComplete =
		getAnsweredRequiredFieldCount( formData ) === REQUIRED_LEAD_MATCHING_FIELDS.length;

	return {
		contact,
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
			supported_business_types: normalizeValues(
				formData.businessTypes,
				optionKeys( getBusinessTypeOptions() )
			),
			ideal_business_types: normalizeValues(
				formData.idealBusinessTypes,
				optionKeys( getBusinessTypeOptions() )
			),
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
				optionKeys( getStoreComplexityOptions() )
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
				optionKeys( getMinimumBudgetOptions() )
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
