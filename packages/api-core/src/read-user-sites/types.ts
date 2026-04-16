export interface UserSitesResponse {
	total: number;
	primary_site_id: number;
	sites: UserSiteResponse[];
}

export interface UserSiteResponse {
	ID: number;
	name: string;
	description: string;
	feed_ID: number;
	URL: string;
	icon: {
		img?: string;
		ico?: string;
	};
	is_following: boolean;
	last_published: string;
	posts_count: number;
	subscribers_count: number;
}
