export interface SitesWithWooPayments {
	id: number;
	url: string;
	blog_id: number;
}

export interface SitesWithWooPaymentsState {
	blogId: number;
	siteUrl: string;
	state: string;
}
