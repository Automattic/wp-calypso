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
