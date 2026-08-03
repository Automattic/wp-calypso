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
 * Agency user capabilities, following the `a4a_<action>_<resource>` convention.
 * Used to declare per-route access requirements in the dashboard router.
 */
export type AgencyCapability =
	| 'a4a_read_managed_sites'
	| 'a4a_read_reports'
	| 'a4a_edit_reports'
	| 'a4a_read_marketplace'
	| 'a4a_read_referrals'
	| 'a4a_read_migrations'
	| 'a4a_read_partner_directory'
	| 'a4a_read_agency_tier'
	| 'a4a_read_users'
	| 'a4a_read_learn'
	| 'a4a_read_amplify'
	| 'a4a_read_exclusive_offers'
	| 'a4a_jetpack_licensing'
	| 'a4a_edit_user_invites'
	| 'a4a_remove_users'
	| 'a4a_revoke_licenses'
	| 'a4a_remove_payment_methods'
	| 'a4a_remove_managed_sites';

/**
 * A single agency, as returned by GET /wpcom/v2/agency. Only the fields
 * consumed by the dashboard are modeled here.
 */
export interface Agency {
	id: number;
	name: string;
	url: string;
	tier?: AgencyTier;
	mcp?: {
		allowed: boolean;
	};
	influenced_revenue?: number;
	created_at: string;
	billing_system?: 'billingdragon' | 'legacy';
	user?: {
		capabilities: string[];
	};
	third_party?: null | {
		pressable?: null | {
			usage?: null | {
				start_date?: string;
				end_date?: string;
			};
		};
	};
}

/**
 * Response from GET /wpcom/v2/agency.
 * Either an array of agencies (agency user) or a client-user payload.
 */
export type AgencyApiResponse = Agency[] | { is_client_user: boolean; billing_type?: string };

export interface McpAvailableAbility {
	name: string;
	title: string;
	description: string;
	category: string;
	enabled: boolean;
}

export interface McpAvailableCategory {
	slug: string;
	label: string;
}

export interface McpSettings {
	enabled: boolean;
	available_categories: McpAvailableCategory[];
	available_abilities: McpAvailableAbility[];
}

export interface McpSettingsUpdate {
	enabled?: boolean;
	abilities?: Record< string, boolean >;
}

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

/**
 * A single learn/resource item, as returned by GET /wpcom/v2/agency/resources.
 */
export interface AgencyResource {
	id: number;
	name: string;
	description: string;
	external_url: string;
	format: string;
	related_product: string;
	related_product_type: string;
	resource_type: string;
	preview_image: string;
	section: string;
	created_at: string;
	updated_at: string;
}

export interface AgencyResourcesResponse {
	status: string;
	results: AgencyResource[];
	total: number;
}

export interface TipaltiIFrameUrl {
	iframe_url: string;
}

export interface TipaltiPayee {
	Status: string;
	IsPayable: boolean;
	PayableReason: string[];
}
