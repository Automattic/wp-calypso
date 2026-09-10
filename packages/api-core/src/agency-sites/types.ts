import type { ReferralApiResponse } from '../agency-referrals/types';

export interface AgencySiteWithPlugin {
	id: number;
	url: string;
	state: string;
	blog_id: number;
}

export interface PendingAgencySiteFeature {
	license_key: string;
	// Server-owned lifecycle state, e.g. `pending` or `provisioning`.
	state: string;
	referral?: ReferralApiResponse;
}

/**
 * A purchased but not yet provisioned site, as returned by
 * GET /agency/{agencyId}/sites/pending.
 */
export interface PendingAgencySite {
	id: number;
	features: {
		wpcom_atomic: PendingAgencySiteFeature;
	};
}

export interface ProvisionAgencySiteParams {
	id: number;
	site_name?: string;
	php_version?: string;
	primary_data_center?: string;
	is_fully_managed_agency_site?: boolean;
}

/**
 * Whether a `.wordpress.com` address is free for the agency to claim.
 */
export interface AgencySiteAddressValidation {
	valid: boolean;
}
