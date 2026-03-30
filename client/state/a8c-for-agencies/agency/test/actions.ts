import { JETPACK_CURRENT_AGENCY_UPDATE } from '../action-types';
import { updateActiveAgencyAvailability, updateActiveAgencyLeadMatching } from '../actions';
import type { A4AStore, Agency } from '../../types';
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

type CurrentAgencyUpdateAction = {
	type: typeof JETPACK_CURRENT_AGENCY_UPDATE;
	activeAgency: Agency;
};

const createLeadMatchingProfile = (
	overrides: Partial< AgencyLeadMatchingProfile > = {}
): AgencyLeadMatchingProfile => ( {
	availability: {
		accepting_work: true,
		lead_eligibility: null,
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
	...overrides,
} );

const createAgency = ( overrides: Partial< Agency > = {} ): Agency =>
	( {
		id: 1,
		name: 'Agency',
		url: '',
		icon: {
			img: '',
			icon: '',
		},
		third_party: null,
		profile: {
			company_details: {
				name: '',
				email: '',
				website: '',
				bio_description: '',
				logo_url: '',
				landing_page_url: '',
				country: '',
			},
			listing_details: {
				is_available: true,
				is_global: false,
				industries: [],
				services: [],
				products: [],
				languages_spoken: [],
			},
			budget_details: {
				budget_lower_range: '',
				budget_upper_range: '',
				has_hourly_rate: false,
				hourly_rate_value: '',
			},
			partner_directory_application: null,
		},
		partner_directory: {
			allowed: false,
			directories: [],
		},
		lead_matching: {
			draft: null,
			profile: null,
			sync: undefined,
		},
		user: {
			role: 'a4a_administrator',
			capabilities: [],
		},
		can_issue_licenses: false,
		notifications: [],
		signup_meta: {
			number_sites: '',
		},
		tier: {
			id: 'pro' as Agency[ 'tier' ][ 'id' ],
			label: '',
			features: [],
			status: 'early_access',
		},
		influenced_revenue: 0,
		approval_status: '',
		created_at: '',
		...overrides,
	} ) as Agency;

const createState = ( activeAgency: Agency ): A4AStore => ( {
	a8cForAgencies: {
		agencies: {
			hasFetched: true,
			isFetching: false,
			activeAgency,
			agencies: [],
			error: null,
			isAgencyClientUser: false,
			userBillingType: 'legacy',
		},
	},
} );

const isCurrentAgencyUpdateAction = ( action: unknown ): action is CurrentAgencyUpdateAction =>
	typeof action === 'object' &&
	action !== null &&
	'type' in action &&
	action.type === JETPACK_CURRENT_AGENCY_UPDATE &&
	'activeAgency' in action;

describe( 'a8c-for-agencies agency actions', () => {
	describe( '#updateActiveAgencyLeadMatching()', () => {
		test( 'merges draft updates against the latest active agency state', () => {
			let state = createState(
				createAgency( {
					lead_matching: {
						draft: createLeadMatchingDraft( {
							regions: [ 'americas' ],
							languages: [ 'english' ],
						} ),
						profile: null,
						sync: undefined,
					},
				} )
			);
			const getState = () => state;
			const dispatch: jest.Mock = jest.fn( ( actionOrThunk: unknown ) => {
				if ( typeof actionOrThunk === 'function' ) {
					return actionOrThunk( dispatch, getState, undefined );
				}

				if ( isCurrentAgencyUpdateAction( actionOrThunk ) ) {
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
				draft: createLeadMatchingDraft( {
					...state.a8cForAgencies.agencies.activeAgency?.lead_matching?.draft,
					businessTypes: [ 'local' ],
				} ),
			} )( dispatch, getState, undefined );

			updateActiveAgencyLeadMatching( {
				profile: createLeadMatchingProfile( {
					geography_and_language: {
						supported_regions: [ 'americas' ],
						global_remote: false,
						supported_languages: [],
					},
				} ),
			} )( dispatch, getState, undefined );

			expect( dispatch ).toHaveBeenCalled();
			const activeAgency = state.a8cForAgencies.agencies.activeAgency;

			expect( activeAgency ).not.toBeNull();
			expect( activeAgency?.lead_matching ).toEqual( {
				draft: {
					...createLeadMatchingDraft(),
					regions: [ 'americas' ],
					languages: [ 'english' ],
					businessTypes: [ 'local' ],
				},
				profile: createLeadMatchingProfile( {
					geography_and_language: {
						supported_regions: [ 'americas' ],
						global_remote: false,
						supported_languages: [],
					},
				} ),
				sync: undefined,
			} );
		} );
	} );

	describe( '#updateActiveAgencyAvailability()', () => {
		test( 'keeps agency details and lead matching availability in sync', () => {
			let state = createState(
				createAgency( {
					lead_matching: {
						draft: null,
						profile: createLeadMatchingProfile(),
						sync: undefined,
					},
				} )
			);
			const getState = () => state;
			const dispatch: jest.Mock = jest.fn( ( actionOrThunk: unknown ) => {
				if ( typeof actionOrThunk === 'function' ) {
					return actionOrThunk( dispatch, getState, undefined );
				}

				if ( isCurrentAgencyUpdateAction( actionOrThunk ) ) {
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
				state.a8cForAgencies.agencies.activeAgency?.profile.listing_details.is_available
			).toBe( false );
			expect(
				state.a8cForAgencies.agencies.activeAgency?.lead_matching?.profile?.availability
					.accepting_work
			).toBe( false );
		} );
	} );
} );
