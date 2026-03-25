import {
	createDefaultLeadMatchingDetails,
	mapLeadMatchingDetailsToProfile,
	mapLeadMatchingFormData,
	mapLeadMatchingProfileToFormData,
} from '../map-application-form-data';
import type { Agency } from 'calypso/state/a8c-for-agencies/types';

describe( 'mapLeadMatchingFormData', () => {
	it( 'returns null when agency lead matching data is missing', () => {
		expect( mapLeadMatchingFormData( null ) ).toBeNull();
	} );

	it( 'maps grouped API data into the reference UI shape', () => {
		const agency = {
			lead_matching: {
				profile: {
					availability: {
						accepting_work: true,
						lead_eligibility: 'ready',
						profile_v2_complete: false,
					},
					geography_and_language: {
						supported_regions: [ 'emea' ],
						global_remote: true,
						supported_languages: [ 'en', 'es' ],
					},
					business_fit: {
						supported_business_types: [ 'local_service' ],
						ideal_business_types: [ 'content_media' ],
						supported_company_sizes: [ 'size_6_50' ],
					},
					platform_and_hosting: {
						supported_hosting_environments: [ 'wordpress_com' ],
						migration_platforms: [ 'shopify' ],
						can_recommend_better_hosting: true,
					},
					ecommerce: {
						supports_ecommerce_projects: true,
						ecommerce_focus: true,
						supported_complexity_flags: [ 'traffic_spikes' ],
					},
					project_types: {
						supported_project_types: [ 'new_woocommerce_store' ],
						core_project_types: [ 'new_woocommerce_store' ],
						accepts_small_fixes: true,
					},
					service_and_budget: {
						max_service_level: 'premium',
						supported_budget_bands: [ 'premium' ],
						minimum_budget_band: '10k_30k',
					},
					timing: {
						supported_start_timings: [ 'within_month' ],
						supports_hard_deadlines: true,
					},
					delivery_model: {
						supported_decision_processes: [ 'multi_stakeholder' ],
						offers_care_plans: true,
						trains_clients: false,
						works_with_internal_technical_teams: true,
						requires_maintenance_plan: false,
					},
				},
			},
		} as Agency;

		expect( mapLeadMatchingFormData( agency ) ).toEqual( {
			regions: [ 'emea' ],
			supportsGlobal: true,
			languages: [ 'en', 'es' ],
			businessTypes: [ 'local_service' ],
			otherBusinessType: '',
			idealBusinessTypes: [ 'content_media' ],
			otherIdealBusinessType: '',
			companySizes: [ 'size_6_50' ],
			hostingEnvironments: [ 'wordpress_com' ],
			supportsHostingRecommendation: true,
			migrationPlatforms: [ 'shopify' ],
			storeComplexities: [ 'traffic_spikes' ],
			projectTypes: [ 'new_woocommerce_store' ],
			supportsQuickHelp: true,
			serviceLevels: [ 'premium' ],
			budgetLevels: [ 'premium' ],
			minimumBudget: '10k_30k',
			timingPreferences: [ 'within_month' ],
			supportsHardDeadlines: true,
			decisionProcesses: [ 'multi_stakeholder' ],
			ongoingRelationships: [ 'care_plans', 'technical_teams' ],
			requiresMaintenance: false,
		} );
	} );
} );

describe( 'mapLeadMatchingProfileToFormData', () => {
	it( 'maps a lead matching profile directly into the reference UI shape', () => {
		const agency = {
			lead_matching: {
				profile: {
					availability: {
						accepting_work: true,
						lead_eligibility: 'ready',
						profile_v2_complete: false,
					},
					geography_and_language: {
						supported_regions: [ 'emea' ],
						global_remote: true,
						supported_languages: [ 'en', 'es' ],
					},
					business_fit: {
						supported_business_types: [ 'local_service' ],
						ideal_business_types: [ 'content_media' ],
						supported_company_sizes: [ 'size_6_50' ],
					},
					platform_and_hosting: {
						supported_hosting_environments: [ 'wordpress_com' ],
						migration_platforms: [ 'shopify' ],
						can_recommend_better_hosting: true,
					},
					ecommerce: {
						supports_ecommerce_projects: true,
						ecommerce_focus: true,
						supported_complexity_flags: [ 'traffic_spikes' ],
					},
					project_types: {
						supported_project_types: [ 'new_woocommerce_store' ],
						core_project_types: [ 'new_woocommerce_store' ],
						accepts_small_fixes: true,
					},
					service_and_budget: {
						max_service_level: 'premium',
						supported_budget_bands: [ 'premium' ],
						minimum_budget_band: '10k_30k',
					},
					timing: {
						supported_start_timings: [ 'within_month' ],
						supports_hard_deadlines: true,
					},
					delivery_model: {
						supported_decision_processes: [ 'multi_stakeholder' ],
						offers_care_plans: true,
						trains_clients: false,
						works_with_internal_technical_teams: true,
						requires_maintenance_plan: false,
					},
				},
			},
		} as Agency;

		expect( mapLeadMatchingProfileToFormData( agency.lead_matching?.profile ) ).toEqual( {
			regions: [ 'emea' ],
			supportsGlobal: true,
			languages: [ 'en', 'es' ],
			businessTypes: [ 'local_service' ],
			otherBusinessType: '',
			idealBusinessTypes: [ 'content_media' ],
			otherIdealBusinessType: '',
			companySizes: [ 'size_6_50' ],
			hostingEnvironments: [ 'wordpress_com' ],
			supportsHostingRecommendation: true,
			migrationPlatforms: [ 'shopify' ],
			storeComplexities: [ 'traffic_spikes' ],
			projectTypes: [ 'new_woocommerce_store' ],
			supportsQuickHelp: true,
			serviceLevels: [ 'premium' ],
			budgetLevels: [ 'premium' ],
			minimumBudget: '10k_30k',
			timingPreferences: [ 'within_month' ],
			supportsHardDeadlines: true,
			decisionProcesses: [ 'multi_stakeholder' ],
			ongoingRelationships: [ 'care_plans', 'technical_teams' ],
			requiresMaintenance: false,
		} );
	} );
} );

describe( 'mapLeadMatchingDetailsToProfile', () => {
	it( 'converts the reference UI shape back to the grouped contract', () => {
		const details = createDefaultLeadMatchingDetails();
		details.regions = [ 'americas' ];
		details.supportsGlobal = true;
		details.languages = [ 'en' ];
		details.businessTypes = [ 'local_service' ];
		details.idealBusinessTypes = [ 'content_media' ];
		details.companySizes = [ 'size_1_5' ];
		details.hostingEnvironments = [ 'wordpress_com' ];
		details.supportsHostingRecommendation = true;
		details.migrationPlatforms = [ 'shopify' ];
		details.storeComplexities = [ 'simple_catalog', 'traffic_spikes' ];
		details.projectTypes = [ 'new_woocommerce_store', 'support_and_fixes' ];
		details.supportsQuickHelp = true;
		details.serviceLevels = [ 'enhanced' ];
		details.budgetLevels = [ 'mid_range' ];
		details.minimumBudget = '3k_10k';
		details.timingPreferences = [ 'flexible' ];
		details.supportsHardDeadlines = true;
		details.decisionProcesses = [ 'small_team' ];
		details.ongoingRelationships = [ 'care_plans', 'training' ];
		details.requiresMaintenance = true;

		expect(
			mapLeadMatchingDetailsToProfile( details, {
				availability: {
					accepting_work: false,
					lead_eligibility: 'ready',
					profile_v2_complete: true,
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
			} )
		).toEqual( {
			availability: {
				accepting_work: false,
				lead_eligibility: 'ready',
				profile_v2_complete: true,
			},
			geography_and_language: {
				supported_regions: [ 'americas' ],
				global_remote: true,
				supported_languages: [ 'en' ],
			},
			business_fit: {
				supported_business_types: [ 'local_service' ],
				ideal_business_types: [ 'content_media' ],
				supported_company_sizes: [ 'size_1_5' ],
			},
			platform_and_hosting: {
				supported_hosting_environments: [ 'wordpress_com' ],
				migration_platforms: [ 'shopify' ],
				can_recommend_better_hosting: true,
			},
			ecommerce: {
				supports_ecommerce_projects: true,
				ecommerce_focus: true,
				supported_complexity_flags: [ 'simple_catalog' ],
			},
			project_types: {
				supported_project_types: [ 'new_woocommerce_store', 'support_and_fixes' ],
				core_project_types: [ 'new_woocommerce_store', 'support_and_fixes' ],
				accepts_small_fixes: true,
			},
			service_and_budget: {
				max_service_level: 'enhanced',
				supported_budget_bands: [ 'mid_range' ],
				minimum_budget_band: '3k_10k',
			},
			timing: {
				supported_start_timings: [ 'flexible' ],
				supports_hard_deadlines: true,
			},
			delivery_model: {
				supported_decision_processes: [ 'small_team' ],
				offers_care_plans: true,
				trains_clients: true,
				works_with_internal_technical_teams: false,
				requires_maintenance_plan: true,
			},
		} );
	} );
} );
