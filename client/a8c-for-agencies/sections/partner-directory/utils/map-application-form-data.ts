import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { availableLanguages } from '../lib/available-languages';
import {
	AgencyDetails,
	AgencyDirectoryApplication,
	AgencyLeadMatchingProfile,
	LeadMatchingDetails,
} from '../types';

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
			core_project_types: [],
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

	const languages = agency.profile.listing_details.languages_spoken?.reduce(
		( acc: string[], val ) => {
			if ( availableLanguages[ val ] ) {
				acc.push( availableLanguages[ val ] );
			} else {
				acc.push( val );
			}
			return acc;
		},
		[]
	);

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
		languagesSpoken: languages,
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
		businessTypes: profile.business_fit?.supported_business_types ?? [],
		otherBusinessType: '',
		idealBusinessTypes: profile.business_fit?.ideal_business_types ?? [],
		otherIdealBusinessType: '',
		companySizes: profile.business_fit?.supported_company_sizes ?? [],
		hostingEnvironments: profile.platform_and_hosting?.supported_hosting_environments ?? [],
		supportsHostingRecommendation: !! profile.platform_and_hosting?.can_recommend_better_hosting,
		migrationPlatforms: profile.platform_and_hosting?.migration_platforms ?? [],
		storeComplexities: profile.ecommerce?.supported_complexity_flags ?? [],
		projectTypes: profile.project_types?.supported_project_types ?? [],
		supportsQuickHelp: !! profile.project_types?.accepts_small_fixes,
		serviceLevels: profile.service_and_budget?.max_service_level
			? [ profile.service_and_budget.max_service_level ]
			: [],
		budgetLevels: profile.service_and_budget?.supported_budget_bands ?? [],
		minimumBudget: profile.service_and_budget?.minimum_budget_band ?? '',
		timingPreferences: profile.timing?.supported_start_timings ?? [],
		supportsHardDeadlines: !! profile.timing?.supports_hard_deadlines,
		decisionProcesses: profile.delivery_model?.supported_decision_processes ?? [],
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
	const supportsEcommerceProjects = formData.projectTypes.includes( 'new_woocommerce_store' );
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
			supported_business_types: formData.businessTypes,
			ideal_business_types: formData.idealBusinessTypes,
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
			supported_complexity_flags: formData.storeComplexities.includes( 'simple_catalog' )
				? [ 'simple_catalog' ]
				: formData.storeComplexities.filter( ( value ) => value !== 'simple_catalog' ),
		},
		project_types: {
			supported_project_types: formData.projectTypes,
			core_project_types: formData.projectTypes,
			accepts_small_fixes: formData.supportsQuickHelp,
		},
		service_and_budget: {
			max_service_level: serviceLevel,
			supported_budget_bands: formData.budgetLevels,
			minimum_budget_band: formData.minimumBudget,
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
