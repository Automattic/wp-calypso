export interface AgencySiteWithPlugin {
	id: number;
	url: string;
	state: string;
	blog_id: number;
}

/**
 * A WordPress.com site an agency has paid for but not yet provisioned. Callers
 * only count the ones whose Atomic feature is still pending and already has a
 * license key attached; the rest cannot be set up yet.
 */
export interface AgencyPendingSite {
	id: number;
	features: {
		wpcom_atomic?: {
			state: string;
			license_key: string;
		};
	};
}

/** The `/agency/{id}/sites` POST response for a single imported site. */
export interface CreateAgencySiteResponse {
	success: boolean;
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

/**
 * A free development site is created outright rather than provisioned against a
 * site the agency already paid for, so there is no pending record to name here.
 */
export interface ProvisionAgencyDevSiteParams {
	site_name?: string;
	php_version?: string;
	primary_data_center?: string;
	is_fully_managed_agency_site?: boolean;
}

/** The `/agency/{id}/sites/provision-dev-site` response, narrowed to the site it created. */
export interface ProvisionAgencyDevSiteResponse {
	site: {
		id: number;
		title: string;
		url: string;
	};
}
