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
	'wordpress' | 'jetpack' | 'woocommerce' | 'pressable' | 'vip';

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
	influenced_revenue?: number;
	approval_status?: AgencyApprovalStatus | '';
	/** False while an unpaid invoice or a missing payment method blocks new licenses. */
	can_issue_licenses?: boolean;
	profile?: AgencyProfile;
	/** The logo the agency last uploaded for a referral email. */
	referrals_logo?: string | null;
	partner_directory?: {
		allowed: boolean;
		directories: AgencyPartnerDirectorySlug[];
	};
	amplify?: {
		allowed: boolean;
	};
	signup_meta?: {
		/** The site count band chosen at signup, e.g. '1-5'. */
		number_sites?: string;
	};
	created_at: string;
	billing_system?: 'billingdragon' | 'legacy';
	user?: {
		capabilities: string[];
		role?: 'a4a_administrator' | 'a4a_manager';
	};
	third_party?: null | {
		pressable?: null | {
			pressable_id?: number;
			/** Null for a regular Pressable plan not bought through the A4A marketplace. */
			a4a_id?: string | null;
			usage?: null | AgencyPressableUsage;
			titan_usage?: null | AgencyPressableTitanUsage;
		};
	};
	notifications?: AgencyNotification[];
}

export interface AgencyPressableUsage {
	storage_gb?: number;
	visits_count?: number;
	sites_count?: number;
	start_date?: string;
	end_date?: string;
}

export interface AgencyPressableTitanOrder {
	domain: string;
	status: string;
	billable_inboxes: number;
	trial_end_at: string | null;
}

export interface AgencyPressableTitanUsage {
	orders?: AgencyPressableTitanOrder[];
}

export interface AgencyNotification {
	timestamp: number;
	reference: string;
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
 * Response from GET /wpcom/v2/agency/stats. Public, program-wide counts.
 */
export interface AgencyProgramStats {
	active_agencies: number;
}

/**
 * The enablement taxonomy used by the v2 resources endpoint.
 *
 * Every value is a stable slug rather than a display string: the client owns
 * the translated labels, so renaming a label never breaks a saved filter.
 */
export type AgencyResourceProduct =
	| 'automattic-for-agencies'
	| 'jetpack'
	| 'pressable'
	| 'woocommerce'
	| 'wordpress-com'
	| 'wordpress-vip';

export type AgencyResourceStage = 'learn' | 'sell' | 'manage' | 'grow';

export type AgencyResourceAudience = 'all' | 'developer' | 'business' | 'client';

/**
 * A new content type means updating this list, so derive filter options from
 * the response rather than from it, and give any slug-keyed lookup a fallback:
 * the API is not validated against this union at runtime.
 */
export type AgencyResourceContentType =
	| 'battle-card'
	| 'blog'
	| 'case-study'
	| 'checklist'
	| 'guide'
	| 'one-pager'
	| 'process-guide'
	| 'reference-guide'
	| 'slide-deck'
	| 'talk-track'
	| 'webinar';

/**
 * How the client opens the resource, and a filter axis of its own.
 *
 * `video` opens `external_url` in the in-portal modal; every other value
 * opens it in a new tab. It also picks the call-to-action label.
 */
export type AgencyResourceFormat = 'pdf' | 'slides' | 'video' | 'doc' | 'webpage';

/**
 * A single resource from the enablement hub, as returned by
 * GET /wpcom/v2/agency/resources/v2.
 */
export interface AgencyEnablementResource {
	id: number;
	name: string;
	description: string;

	/**
	 * The destination for every format: the file for a PDF or deck, the page for
	 * a webpage, the watch URL for a video. `format` says how to open it.
	 *
	 * There is no thumbnail field: cards are built from `product`,
	 * `content_type` and `name` rather than from supplied artwork.
	 */
	external_url: string;

	product: AgencyResourceProduct;
	stage: AgencyResourceStage;
	audience: AgencyResourceAudience;
	content_type: AgencyResourceContentType;
	format: AgencyResourceFormat;

	/** Surfaced first in every view. Labelled "Top resource" in the UI. */
	is_featured: boolean;
	created_at: string;
	updated_at: string;
}

export interface AgencyEnablementResourcesResponse {
	status: string;
	results: AgencyEnablementResource[];
	total: number;
}

/**
 * Engagement recorded per resource. `open` is the event the endpoint already
 * records; `preview` and `download` are the in-portal actions v2 adds.
 */
export type AgencyResourceEventType = 'open' | 'preview' | 'download';

export interface AgencyResourceEvent {
	resource_id: number;
	resource_name: string;
	agency_id: number;
	event_type?: AgencyResourceEventType;
}

export interface AgencyResourceEventResponse {
	success: boolean;
}

export interface TipaltiIFrameUrl {
	iframe_url: string;
}

export interface TipaltiPayee {
	Status: string;
	IsPayable: boolean;
	PayableReason: string[];
}

/**
 * A client an agency refers for hosting, as the referral endpoints take it.
 * `state` is only accepted for the US, Canada and Australia.
 */
export interface AgencyHostingReferral {
	company_name: string;
	address: string;
	country_code: string;
	state: string;
	city: string;
	zip: string;
	first_name: string;
	last_name: string;
	title: string;
	phone: string;
	email: string;
	website: string;
	opportunity_description: string;
}

export interface AgencyVipPartnerOpportunity extends AgencyHostingReferral {
	lead_type: string;
	is_rfp: boolean;
}

export interface AgencyHostingReferralResponse {
	status: string;
	message: string;
}
