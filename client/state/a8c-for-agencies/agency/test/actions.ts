import { JETPACK_CURRENT_AGENCY_UPDATE } from '../action-types';
import { updateActiveAgencyAvailability, updateActiveAgencyLeadMatching } from '../actions';
import type {
	AgencyLeadMatchingProfile,
	LeadMatchingDetails,
} from 'calypso/a8c-for-agencies/sections/partner-directory/types';

const createLeadMatchingDraft = (
	overrides: Partial< LeadMatchingDetails > = {}
): LeadMatchingDetails => ( {
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
	...overrides,
} );

type TestState = {
	a8cForAgencies: {
		agencies: {
			isFetching: boolean;
			activeAgency: {
				id: number;
				name: string;
				profile?: {
					listing_details: {
						is_available: boolean;
					};
				};
				lead_matching: {
					draft?: LeadMatchingDetails | null;
					profile?: AgencyLeadMatchingProfile | null;
					sync?: unknown;
				};
			};
		};
	};
};

describe( 'a8c-for-agencies agency actions', () => {
	describe( '#updateActiveAgencyLeadMatching()', () => {
		test( 'merges draft updates against the latest active agency state', () => {
			let state: TestState = {
				a8cForAgencies: {
					agencies: {
						isFetching: false,
						activeAgency: {
							id: 1,
							name: 'Agency',
							lead_matching: {
								draft: createLeadMatchingDraft( {
									regions: [ 'americas' ],
									languages: [ 'english' ],
								} ),
								profile: null,
								sync: undefined,
							},
						},
					},
				},
			};
			const getState = () => state;
			const dispatch: jest.Mock = jest.fn( ( actionOrThunk: unknown ) => {
				if ( typeof actionOrThunk === 'function' ) {
					return actionOrThunk( dispatch, getState, undefined );
				}

				if (
					typeof actionOrThunk === 'object' &&
					actionOrThunk !== null &&
					'type' in actionOrThunk &&
					actionOrThunk.type === JETPACK_CURRENT_AGENCY_UPDATE
				) {
					state = {
						...state,
						a8cForAgencies: {
							...state.a8cForAgencies,
							agencies: {
								...state.a8cForAgencies.agencies,
								activeAgency: actionOrThunk.activeAgency,
							},
						},
					};
				}

				return actionOrThunk;
			} );

			updateActiveAgencyLeadMatching( {
				draft: {
					...state.a8cForAgencies.agencies.activeAgency.lead_matching.draft,
					businessTypes: [ 'local' ],
				},
			} )( dispatch, getState, undefined );

			updateActiveAgencyLeadMatching( {
				profile: {
					availability: {
						accepting_work: true,
						lead_eligibility: null,
						profile_v2_complete: false,
					},
					geography_and_language: {
						supported_regions: [ 'americas' ],
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
				},
			} )( dispatch, getState, undefined );

			expect( dispatch ).toHaveBeenCalled();
			expect( state.a8cForAgencies.agencies.activeAgency.lead_matching ).toEqual( {
				draft: {
					...createLeadMatchingDraft(),
					regions: [ 'americas' ],
					languages: [ 'english' ],
					businessTypes: [ 'local' ],
				},
				profile: {
					availability: {
						accepting_work: true,
						lead_eligibility: null,
						profile_v2_complete: false,
					},
					geography_and_language: {
						supported_regions: [ 'americas' ],
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
				},
				sync: undefined,
			} );
		} );
	} );

	describe( '#updateActiveAgencyAvailability()', () => {
		test( 'keeps agency details and lead matching availability in sync', () => {
			let state: TestState = {
				a8cForAgencies: {
					agencies: {
						isFetching: false,
						activeAgency: {
							id: 1,
							name: 'Agency',
							profile: {
								listing_details: {
									is_available: true,
								},
							},
							lead_matching: {
								profile: {
									availability: {
										accepting_work: true,
									},
								},
							},
						},
					},
				},
			};
			const getState = () => state;
			const dispatch: jest.Mock = jest.fn( ( actionOrThunk: unknown ) => {
				if ( typeof actionOrThunk === 'function' ) {
					return actionOrThunk( dispatch, getState, undefined );
				}

				if (
					typeof actionOrThunk === 'object' &&
					actionOrThunk !== null &&
					'type' in actionOrThunk &&
					actionOrThunk.type === JETPACK_CURRENT_AGENCY_UPDATE
				) {
					state = {
						...state,
						a8cForAgencies: {
							...state.a8cForAgencies,
							agencies: {
								...state.a8cForAgencies.agencies,
								activeAgency: actionOrThunk.activeAgency,
							},
						},
					};
				}

				return actionOrThunk;
			} );

			updateActiveAgencyAvailability( false )( dispatch, getState, undefined );

			expect(
				state.a8cForAgencies.agencies.activeAgency.profile.listing_details.is_available
			).toBe( false );
			expect(
				state.a8cForAgencies.agencies.activeAgency.lead_matching.profile.availability.accepting_work
			).toBe( false );
		} );
	} );
} );
