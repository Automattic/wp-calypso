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
	blog_id?: any; // This has to be `any` as sites/new will return whatever value is passed to it as `$blog_id` if create blog fails.
}

export type NewSiteResponse =
	| NewSiteSuccessResponse
	| NewSiteErrorResponse
	| NewSiteErrorCreateBlog;

export interface CreateSiteParams {
	blog_name: string;
	blog_title?: string;
	authToken?: string;
	options?: {
		site_vertical?: string;
		site_vertical_name?: string;
		site_vertical_slug?: string;
		site_information?: {
			title?: string;
		};
		site_creation_flow?: string;
		theme?: string;
		template?: string;
		timezone_string?: string;
		font_headings?: string;
		font_base?: string;
	};
}

export interface SiteDetails {
	ID: number;
	name: string;
	description: string;
	URL: string;
}

export interface SiteError {
	error: string;
	message: string;
}

export type SiteResponse = SiteDetails | SiteError;
