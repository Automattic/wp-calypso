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

export interface CreateSiteParams {
	blog_name: string;
	blog_title?: string;
	authToken?: string;
	public?: number;
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
	};
}

export interface SiteDetails {
	ID: number;
	name: string;
	description: string;
	URL: string;
	launch_status: string;
	options: {
		created_at: string;
	};
	plan?: {
		is_free: boolean;
	};
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
