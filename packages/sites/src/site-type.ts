export interface MinimumSite {
	URL: string;
	name: string | undefined;
	slug: string;
	title: string;
	visible?: boolean;
	is_coming_soon?: boolean;
	is_private?: boolean;
	launch_status?: string;
	user_interactions?: string[];
	options?: {
		is_redirect?: boolean;
		updated_at?: string;
	};
}
