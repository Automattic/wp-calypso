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
						supported_hosting_environments: [ 'wpcom' ],
						migration_platforms: [ 'shopify' ],
						can_recommend_better_hosting: true,
					},
					ecommerce: {
						supports_ecommerce_projects: true,
						ecommerce_focus: true,
						supported_complexity_flags: [ 'traffic_spikes' ],
					},
					project_types: {
						supported_project_types: [ 'new_woocommerce' ],
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
			hostingEnvironments: [ 'wpcom' ],
			supportsHostingRecommendation: true,
			migrationPlatforms: [ 'shopify' ],
			storeComplexities: [ 'traffic_spikes' ],
			projectTypes: [ 'new_woocommerce' ],
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
						supported_hosting_environments: [ 'wpcom' ],
						migration_platforms: [ 'shopify' ],
						can_recommend_better_hosting: true,
					},
					ecommerce: {
						supports_ecommerce_projects: true,
						ecommerce_focus: true,
						supported_complexity_flags: [ 'traffic_spikes' ],
					},
					project_types: {
						supported_project_types: [ 'new_woocommerce' ],
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
			hostingEnvironments: [ 'wpcom' ],
			supportsHostingRecommendation: true,
			migrationPlatforms: [ 'shopify' ],
			storeComplexities: [ 'traffic_spikes' ],
			projectTypes: [ 'new_woocommerce' ],
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
		details.hostingEnvironments = [ 'wpcom' ];
		details.supportsHostingRecommendation = true;
		details.migrationPlatforms = [ 'shopify' ];
		details.storeComplexities = [ 'none_simple', 'traffic_spikes' ];
		details.projectTypes = [ 'new_woocommerce', 'fix_ongoing_support' ];
		details.supportsQuickHelp = true;
		details.serviceLevels = [ 'enhanced' ];
		details.budgetLevels = [ 'mid_range' ];
		details.minimumBudget = 'above_30k';
		details.timingPreferences = [ 'flexible' ];
		details.supportsHardDeadlines = true;
		details.decisionProcesses = [ 'formal_procurement' ];
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
				supported_hosting_environments: [ 'wpcom' ],
				migration_platforms: [ 'shopify' ],
				can_recommend_better_hosting: true,
			},
			ecommerce: {
				supports_ecommerce_projects: true,
				ecommerce_focus: true,
				supported_complexity_flags: [ 'none_simple', 'traffic_spikes' ],
			},
			project_types: {
				supported_project_types: [ 'new_woocommerce', 'fix_ongoing_support' ],
				accepts_small_fixes: true,
			},
			service_and_budget: {
				max_service_level: 'enhanced',
				supported_budget_bands: [ 'mid_range' ],
				minimum_budget_band: 'above_30k',
			},
			timing: {
				supported_start_timings: [ 'flexible' ],
				supports_hard_deadlines: true,
			},
			delivery_model: {
				supported_decision_processes: [ 'formal_procurement' ],
				offers_care_plans: true,
				trains_clients: true,
				works_with_internal_technical_teams: false,
				requires_maintenance_plan: true,
			},
		} );
	} );

	it( 'keeps online store business type values for the WPCOM endpoint payload', () => {
		const details = createDefaultLeadMatchingDetails();
		details.businessTypes = [ 'online_store_physical', 'content_media' ];
		details.idealBusinessTypes = [ 'online_store_digital' ];

		expect( mapLeadMatchingDetailsToProfile( details, null ).business_fit ).toEqual( {
			supported_business_types: [ 'online_store_physical', 'content_media' ],
			ideal_business_types: [ 'online_store_digital' ],
			supported_company_sizes: [],
		} );
	} );

	it( 'keeps only directly supported business type values on hydration', () => {
		expect(
			mapLeadMatchingProfileToFormData( {
				availability: {
					accepting_work: true,
					lead_eligibility: 'ready',
					profile_v2_complete: false,
				},
				geography_and_language: {
					supported_regions: [],
					global_remote: false,
					supported_languages: [],
				},
				business_fit: {
					supported_business_types: [ 'local_service', 'online_store_physical', 'other' ],
					ideal_business_types: [ 'content_media', 'online_store_digital', 'other' ],
					supported_company_sizes: [],
				},
				platform_and_hosting: {
					supported_hosting_environments: [ 'wpcom', 'unknown' ],
					migration_platforms: [ 'shopify', 'wordpress', 'other' ],
					can_recommend_better_hosting: false,
				},
				ecommerce: {
					supports_ecommerce_projects: true,
					ecommerce_focus: true,
					supported_complexity_flags: [ 'custom_pricing', 'customer_portals', 'simple_catalog' ],
				},
				project_types: {
					supported_project_types: [ 'migration', 'new_website', 'redesign', 'new_wordpress_site' ],
					accepts_small_fixes: false,
				},
				service_and_budget: {
					max_service_level: '',
					supported_budget_bands: [ 'mid_range', 'mid-range' ],
					minimum_budget_band: 'above_30k',
				},
				timing: {
					supported_start_timings: [ 'book_1_3_months', 'planning_1_3_months' ],
					supports_hard_deadlines: false,
				},
				delivery_model: {
					supported_decision_processes: [ 'formal_procurement', 'solo_decider' ],
					offers_care_plans: false,
					trains_clients: false,
					works_with_internal_technical_teams: false,
					requires_maintenance_plan: false,
				},
			} )
		).toMatchObject( {
			businessTypes: [ 'local_service', 'online_store_physical', 'other' ],
			idealBusinessTypes: [ 'content_media', 'online_store_digital', 'other' ],
			hostingEnvironments: [ 'wpcom' ],
			migrationPlatforms: [ 'shopify' ],
			storeComplexities: [ 'custom_pricing', 'customer_portals' ],
			projectTypes: [ 'migration', 'new_website', 'redesign' ],
			budgetLevels: [ 'mid_range' ],
			minimumBudget: 'above_30k',
			timingPreferences: [ 'book_1_3_months' ],
			decisionProcesses: [ 'formal_procurement' ],
		} );
	} );

	it( 'round-trips other as a valid saved business type option', () => {
		const details = createDefaultLeadMatchingDetails();
		details.businessTypes = [ 'local_service', 'other' ];
		details.idealBusinessTypes = [ 'other' ];

		const profile = mapLeadMatchingDetailsToProfile( details, null );
		const hydratedDetails = mapLeadMatchingProfileToFormData( profile );

		expect( profile.business_fit ).toEqual( {
			supported_business_types: [ 'local_service', 'other' ],
			ideal_business_types: [ 'other' ],
			supported_company_sizes: [],
		} );
		expect( hydratedDetails ).toMatchObject( {
			businessTypes: [ 'local_service', 'other' ],
			idealBusinessTypes: [ 'other' ],
			otherBusinessType: '',
			otherIdealBusinessType: '',
		} );
	} );
} );
