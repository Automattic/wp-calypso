export interface NewSiteBlogDetails {
	url: string;
	blogid: number;
	blogname: string;
	site_slug?: string;
	xmlrpc: string;
}

export interface NewSiteSuccessResponse {
	success: boolean;
	blog_details: NewSiteBlogDetails;
	is_signup_sandbox?: boolean;
}

export interface NewSiteErrorResponse {
	error: string;
	status: number;
	statusCode: number;
	name: string;
	message: string;
}

export interface NewSiteErrorCreateBlog {
	// This has to be `any` as sites/new will return whatever value is passed to it as `$blog_id` if create blog fails.
	blog_id?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type NewSiteResponse =
	| NewSiteSuccessResponse
	| NewSiteErrorResponse
	| NewSiteErrorCreateBlog;

export enum Visibility {
	PublicIndexed = 1,
	PublicNotIndexed = 0,
	Private = -1,
}

export interface CreateSiteParams {
	blog_name: string;
	blog_title?: string;
	authToken?: string;
	public?: Visibility;
	options?: {
		site_vertical?: string;
		site_vertical_name?: string;
		site_vertical_slug?: string;
		site_information?: {
			title?: string;
		};
		lang_id?: number;
		site_creation_flow?: string;
		enable_fse?: boolean;
		theme?: string;
		template?: string;
		timezone_string?: string;
		font_headings?: string;
		font_base?: string;
		use_patterns?: boolean;
		selected_features?: string[];
		wpcom_public_coming_soon?: number;
		anchor_fm_podcast_id?: string;
	};
}

export interface SiteDetailsPlan {
	product_id: number;
	product_slug: string;
	product_name: string;
	product_name_short: string;
	expired: boolean;
	billing_period: string;
	user_is_owner: boolean;
	is_free: boolean;
}

export interface SiteDetails {
	ID: number;
	name: string | undefined;
	description: string;
	URL: string;
	launch_status: string;
	options: {
		created_at: string;
		selected_features?: string[];
	};
	plan?: SiteDetailsPlan;
}

export interface SiteError {
	error: string;
	message: string;
}

export type SiteResponse = SiteDetails | SiteError;

export interface Cart {
	blog_id: number;
	cart_key: number;
	coupon: string;
	coupon_discounts: unknown[];
	coupon_discounts_integer: unknown[];
	is_coupon_applied: boolean;
	has_bundle_credit: boolean;
	next_domain_is_free: boolean;
	next_domain_condition: string;
	products: unknown[];
	total_cost: number;
	currency: string;
	total_cost_display: string;
	total_cost_integer: number;
	temporary: boolean;
	tax: unknown;
	sub_total: number;
	sub_total_display: string;
	sub_total_integer: number;
	total_tax: number;
	total_tax_display: string;
	total_tax_integer: number;
	credits: number;
	credits_display: string;
	credits_integer: number;
	allowed_payment_methods: unknown[];
	create_new_blog: boolean;
	messages: Record< 'errors' | 'success', unknown >;
}

export interface Domain {
	primary_domain: boolean;
	blog_id: number;
	subscription_id?: any;
	current_user_can_manage: boolean;
	can_set_as_primary: boolean;
	domain: string;
	supports_domain_connect?: any;
	email_forwards_count: number;
	expiry: boolean;
	expiry_soon: boolean;
	expired: boolean;
	new_registration: boolean;
	auto_renewing: boolean;
	pending_registration: boolean;
	pending_registration_time: string;
	has_registration: boolean;
	points_to_wpcom: boolean;
	privacy_available: boolean;
	private_domain: boolean;
	partner_domain: boolean;
	wpcom_domain: boolean;
	has_zone: boolean;
	is_renewable: boolean;
	is_redeemable: boolean;
	is_subdomain: boolean;
	is_eligible_for_inbound_transfer: boolean;
	is_locked: boolean;
	is_wpcom_staging_domain: boolean;
	transfer_away_eligible_at?: any;
	type: string;
	registration_date: string;
	auto_renewal_date: string;
	google_apps_subscription?: unknown[];
	titan_mail_subscription?: unknown[];
	pending_whois_update: boolean;
	tld_maintenance_end_time?: any;
	ssl_status?: any;
	supports_gdpr_consent_management: boolean;
	supports_transfer_approval: boolean;
	domain_registration_agreement_url: string;
	contact_info_disclosure_available: boolean;
	contact_info_disclosed: boolean;
	renewable_until?: any;
	redeemable_until?: any;
	bundled_plan_subscription_id?: any;
	product_slug?: any;
	owner: string;
}

export interface SiteLaunchState {
	status: SiteLaunchStatus;
	errorCode: SiteLaunchError | undefined;
}

export enum SiteLaunchError {
	INTERNAL = 'internal',
}

export enum SiteLaunchStatus {
	UNINITIALIZED = 'unintialized',
	IN_PROGRESS = 'in_progress',
	SUCCESS = 'success',
	FAILURE = 'failure',
}
