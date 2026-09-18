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
