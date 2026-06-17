export type AgencyTierId =
	| 'emerging-partner'
	| 'agency-partner'
	| 'pro-agency-partner'
	| 'vip-pro-agency-partner'
	| 'premier-partner';

export type AgencyTierStatus = 'early_access' | 'tier_protected';

export interface AgencyTier {
	id?: AgencyTierId;
	label?: string;
	features?: string[];
	status?: AgencyTierStatus;
}

/**
 * A single agency, as returned by GET /wpcom/v2/agency. Only the fields
 * consumed by the dashboard are modeled here.
 */
export interface Agency {
	id: number;
	name: string;
	url: string;
	tier?: AgencyTier;
	influenced_revenue?: number;
	created_at: string;
	billing_system?: 'billingdragon' | 'legacy';
}

/**
 * Response from GET /wpcom/v2/agency.
 * Either an array of agencies (agency user) or a client-user payload.
 */
export type AgencyApiResponse = Agency[] | { is_client_user: boolean; billing_type?: string };

export interface AgencyBlog {
	name: string;
	existing_wpcom_license_count: number;
	referral_status: 'active' | 'pending' | 'canceled' | 'archived';
	billing_system?: 'billingdragon' | 'legacy';
	prices: {
		actual_price: number;
		currency: string;
	};
}

export type AmplifyMode = 'human' | 'ai' | 'fullanalysis';

export interface AmplifyScore {
	human: number | null;
	ai: number | null;
}

/**
 * A finished Amplify report. Served by GET /agency/{id}/amplify/reports
 * (list) — the single-report endpoint is not wired (list + pdf_url suffices).
 * Fields mirror the REST surface's snake_case shape.
 */
export interface AmplifyReport {
	id: string;
	status: 'completed';
	url: string;
	agency_name: string;
	mode: AmplifyMode;
	timestamp: string;
	user_id: number | null;
	score: AmplifyScore;
	pdf_url: string | null;
}

/**
 * An in-flight or failed Amplify run. Served by GET /agency/{id}/amplify/jobs.
 * `id` is the Trigger.dev run id — distinct from a finished report's id.
 * `failure_reason` is present only when `status` is 'failed'.
 */
export interface AmplifyJob {
	id: string;
	status: 'pending' | 'failed';
	url: string;
	mode: AmplifyMode;
	timestamp: string;
	failure_reason?: string;
}

/**
 * The 202 response from POST /agency/{id}/amplify/reports. `id` is the
 * Trigger.dev run id; correlate it with the jobs list, not the reports list.
 */
export interface AmplifyAnalysisRun {
	id: string;
	status: 'pending';
	url: string;
	mode: AmplifyMode;
	timestamp: string;
}

export interface SubmitAmplifyAnalysisParams {
	url: string;
	mode: AmplifyMode;
}

/** Envelope returned by the list endpoints. */
export interface AmplifyReportsResponse {
	reports: AmplifyReport[];
}

export interface AmplifyJobsResponse {
	jobs: AmplifyJob[];
}
