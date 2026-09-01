export type AgencyTierId =
	| 'emerging-partner'
	| 'agency-partner'
	| 'pro-agency-partner'
	| 'vip-pro-agency-partner'
	| 'premier-partner';

export type AgencyTierStatus = 'early_access' | 'tier_protected';

export type AgencyApprovalStatus = 'pending' | 'approved' | 'rejected';

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

export type AgencyPartnerDirectorySlug =
	| 'wordpress'
	| 'jetpack'
	| 'woocommerce'
	| 'pressable'
	| 'vip';

export type AgencyPartnerDirectoryEntryStatus = 'pending' | 'approved' | 'rejected' | 'closed';

export interface AgencyPartnerDirectoryEntry {
	status?: AgencyPartnerDirectoryEntryStatus;
	directory: AgencyPartnerDirectorySlug;
	urls: string[];
	note: string;
	is_published?: boolean;
}

export interface AgencyPartnerDirectoryApplication {
	status?: 'pending' | 'in-progress' | 'completed';
	directories: AgencyPartnerDirectoryEntry[];
	feedback_url: string;
	is_published?: boolean;
}

export interface AgencyProfile {
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
	partner_directory_application: AgencyPartnerDirectoryApplication | null;
}

/**
 * Body of PUT /wpcom/v2/agency/$agencyId/profile.
 */
export interface AgencyProfileUpdate {
	profile_company_name: string;
	profile_company_email: string;
	profile_company_website: string;
	profile_company_bio_description: string;
	profile_company_logo_url: string;
	profile_company_landing_page_url: string;
	profile_company_country: string;
	profile_listing_is_global: boolean;
	profile_listing_is_available: boolean;
	profile_listing_industries: string[];
	profile_listing_languages_spoken: string[];
	profile_listing_services: string[];
	profile_listing_products: string[];
	profile_budget_budget_lower_range: string;
}

/**
 * Response from POST /wpcom/v2/agency/$agencyId/media.
 */
export interface AgencyMediaUpload {
	asset_type: string;
	attachment_id: number;
	url: string;
	mime: string;
	width: number;
	height: number;
}

/**
 * Body of PUT /wpcom/v2/agency/$agencyId/profile/application.
 */
export interface AgencyPartnerDirectoryApplicationUpdate {
	services: string[];
	products: string[];
	directories: {
		directory: AgencyPartnerDirectorySlug;
		urls: string[];
		note?: string;
	}[];
	feedback_url: string;
	is_published?: boolean;
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
	mcp?: {
		allowed: boolean;
	};
	influenced_revenue?: number;
	approval_status?: AgencyApprovalStatus | '';
	profile?: AgencyProfile;
	partner_directory?: {
		allowed: boolean;
		directories: AgencyPartnerDirectorySlug[];
	};
	created_at: string;
	billing_system?: 'billingdragon' | 'legacy';
	user?: {
		capabilities: string[];
	};
	third_party?: null | {
		pressable?: null | {
			pressable_id?: number;
			/** Null for a regular Pressable plan not bought through the A4A marketplace. */
			a4a_id?: string | null;
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
	/**
	 * Whether the ability only reads data. Write abilities are flagged with an
	 * explicit `false`; abilities from a response predating the flag omit it and
	 * are treated as read-only.
	 */
	readonly?: boolean;
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
