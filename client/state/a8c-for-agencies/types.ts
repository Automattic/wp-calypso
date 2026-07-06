import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingSyncState,
	DirectoryApplicationType,
	LeadMatchingDetails,
} from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import type { AgencyTier } from 'calypso/a8c-for-agencies/sections/agency-tier/types';

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: unknown;
}

// Define interfaces for Titan Email data
export interface TitanOrder {
	domain: string;
	status: string;
	order_plan: string;
	billable_inboxes: number;
	trial_end_at: string | null;
}

export interface TitanUsage {
	orders: TitanOrder[];
}

export type AgencyTierStatus = 'early_access' | 'tier_protected';

export type PaymentNoticeState = 'card_expiry' | 'renewal_failure';

export type PaymentNoticeSeverity = 'warning' | 'error';

export interface PaymentNotice {
	state: PaymentNoticeState;
	severity: PaymentNoticeSeverity;
	source?: string;
	title?: string;
	content?: string;
	action_label?: string;
	action_url?: string;
	primary_action_label?: string;
	primary_action_url?: string;
	secondary_action_label?: string;
	secondary_action_url?: string;
	failed_at?: string;
	grace_period_ends_at?: string;
	affected_subscription_ids?: number[];
	can_current_user_manage_payment_method?: boolean;
}

export interface Agency {
	id: number;
	name: string;
	url: string;
	icon: {
		img: string;
		icon: string;
	};
	third_party: null | {
		pressable: null | {
			a4a_id: string;
			email: string;
			name: string;
			pressable_id: number;
			usage?: null | {
				status: string;
				storage_gb: number;
				visits_count: number;
				sites_count: number;
				start_date: string;
				end_date: string;
				created_at: number;
			};
			titan_usage?: null | TitanUsage;
		};
	};
	profile: {
		company_details: {
			name: string;
			email: string;
			website: string;
			bio_description: string;
			logo_url: string;
			landing_page_url: string;
			country: string;
		};
		listing_details: {
			is_available: boolean;
			is_global: boolean;
			industries: string[];
			services: string[];
			products: string[];
			languages_spoken: string[];
		};
		budget_details: {
			budget_lower_range: string;
			budget_upper_range: string;
			has_hourly_rate: boolean;
			hourly_rate_value: string;
		};
		partner_directory_application: null | {
			status?: 'pending' | 'in-progress' | 'completed';
			directories: {
				status: 'pending' | 'approved' | 'rejected' | 'closed';
				directory: DirectoryApplicationType;
				urls: string[];
				note: string;
				is_published?: boolean;
			}[];
			feedback_url: string;
			is_published?: boolean;
		};
	};
	partner_directory: {
		allowed: boolean;
		directories: DirectoryApplicationType[];
	};
	mcp?: {
		allowed: boolean;
	};
	lead_matching?: {
		allowed?: boolean;
		draft?: LeadMatchingDetails | null;
		profile?: AgencyLeadMatchingProfile | null;
		sync?: AgencyLeadMatchingSyncState;
	};
	user: {
		role: 'a4a_administrator' | 'a4a_manager';
		capabilities: string[];
	};
	can_issue_licenses: boolean;
	referrals_logo?: string | null;
	notifications:
		| [
				{
					timestamp: number;
					reference: string;
				},
		  ]
		| [];
	signup_meta: {
		number_sites: string;
	};
	tier: {
		id: AgencyTier;
		label: string;
		features: string[];
		status: AgencyTierStatus;
	};
	influenced_revenue: number;
	approval_status: ApprovalStatus | '';
	created_at: string;
	billing_system?: 'billingdragon' | 'legacy';
	payment_notice?: PaymentNotice | null;
}

export type UserBillingType = 'legacy' | 'billingdragon';

export interface AgencyStore {
	hasFetched: boolean;
	isFetching: boolean;
	activeAgency: Agency | null;
	agencies: Agency[] | [];
	error: APIError | null;
	isAgencyClientUser: boolean;
	userBillingType: UserBillingType;
}

export type AgencyThunkAction< A extends Action = AnyAction, R = unknown > = ThunkAction<
	void,
	A4AStore,
	R,
	A
>;

interface CombinedStore {
	agencies: AgencyStore;
}

/**
 * Represents the entire Redux store but defines only the parts that the A4A deals with.
 */
export interface A4AStore {
	a8cForAgencies: CombinedStore;
}

export enum ApprovalStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
}
