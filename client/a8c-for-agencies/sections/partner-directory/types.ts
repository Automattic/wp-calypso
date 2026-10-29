export type DirectoryApplicationType =
	'wordpress' | 'jetpack' | 'woocommerce' | 'pressable' | 'vip';

export interface AgencyDetails {
	name: string;
	email: string;
	website: string;
	bioDescription: string;
	logoUrl: string;
	landingPageUrl: string;
	country: string;
	isGlobal: boolean;
	isAvailable: boolean;
	industries: string[];
	services: string[];
	products: string[];
	languagesSpoken: string[];
	budgetLowerRange: string;
}

export interface LeadMatchingDetails {
	phoneNumber: string;
	phoneCountryCode: string;
	bookingLink: string;
	regions: string[];
	supportsGlobal: boolean;
	languages: string[];
	businessTypes: string[];
	// Intentionally dormant because HubSpot does not currently support a separate Other text field.
	otherBusinessType: string;
	idealBusinessTypes: string[];
	// Intentionally dormant because HubSpot does not currently support a separate Other text field.
	otherIdealBusinessType: string;
	companySizes: string[];
	hostingEnvironments: string[];
	supportsHostingRecommendation: boolean;
	migrationPlatforms: string[];
	storeComplexities: string[];
	projectTypes: string[];
	supportsQuickHelp: boolean;
	serviceLevels: string[];
	budgetLevels: string[];
	minimumBudget: string;
	timingPreferences: string[];
	supportsHardDeadlines: boolean;
	decisionProcesses: string[];
	ongoingRelationships: string[];
	requiresMaintenance: boolean;
}

export interface AgencyLeadMatchingProfile {
	contact?: {
		phone: string;
		booking_link: string;
	};
	availability: {
		accepting_work: boolean | null;
		lead_eligibility: string | null;
		profile_v2_complete: boolean | null;
	};
	geography_and_language: {
		supported_regions: string[];
		global_remote: boolean | null;
		supported_languages: string[];
	};
	business_fit: {
		supported_business_types: string[];
		ideal_business_types: string[];
		supported_company_sizes: string[];
	};
	platform_and_hosting: {
		supported_hosting_environments: string[];
		migration_platforms: string[];
		can_recommend_better_hosting: boolean | null;
	};
	ecommerce: {
		supports_ecommerce_projects: boolean;
		ecommerce_focus: boolean | null;
		supported_complexity_flags: string[];
	};
	project_types: {
		supported_project_types: string[];
		accepts_small_fixes: boolean | null;
	};
	service_and_budget: {
		max_service_level: string;
		supported_budget_bands: string[];
		minimum_budget_band: string;
	};
	timing: {
		supported_start_timings: string[];
		supports_hard_deadlines: boolean | null;
	};
	delivery_model: {
		supported_decision_processes: string[];
		offers_care_plans: boolean | null;
		trains_clients: boolean | null;
		works_with_internal_technical_teams: boolean | null;
		requires_maintenance_plan: boolean | null;
	};
}

export interface AgencyLeadMatchingSyncState {
	status?: string;
	last_synced_at?: string | null;
	error?: string | null;
}

export interface AgencyLeadMatchingResponse {
	agency_id: number;
	lead_matching_profile: AgencyLeadMatchingProfile;
	sync?: AgencyLeadMatchingSyncState;
}
