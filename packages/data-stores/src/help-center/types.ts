export type Location = {
	pathname: string;
	search?: string;
	hash?: string;
	state?: unknown;
	key?: string;
};

export interface SiteLogo {
	id: number;
	sizes: never[];
	url: string;
}

export interface Plan {
	product_slug: string;
}

export interface HelpCenterSite {
	ID: number | string;
	name: string;
	URL: string;
	plan: Plan;
	is_wpcom_atomic: boolean;
	jetpack: boolean;
	logo: SiteLogo;
}
