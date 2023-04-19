export interface APIRewindStagingSiteList {
	ok: boolean;
	error: string;
	sites_info: APIRewindStagingSiteInfo[];
}

export interface APIRewindStagingSiteInfo {
	blog_id: number;
	domain: string;
	siteurl: string;
	staging: boolean;
}
