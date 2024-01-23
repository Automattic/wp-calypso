export interface MinimumSite {
	ID: number;
	URL: string;
	name: string | undefined;
	slug: string;
	title: string;
	visible?: boolean;
	is_coming_soon?: boolean;
	is_private?: boolean;
	launch_status?: string;
	user_interactions?: string[];
	is_wpcom_staging_site?: boolean;
	site_owner?: number | null;
	options?: {
		wpcom_production_blog_id?: number;
		wpcom_staging_blog_ids?: number[];
		is_redirect?: boolean;
		updated_at?: string;
	};
}
