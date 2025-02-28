export interface SitesWithWooPayments {
	id: number;
	url: string;
	blog_id: number;
}

export interface SitesWithWooPaymentsPlugins {
	id: number;
	url: string;
	state: string;
	blog_id: number;
}

export interface SitesWithWooPaymentsState {
	blogId: number;
	siteUrl: string;
	state: string;
}

export interface WooPaymentsData {
	total?: {
		payout: number;
		tpv: number;
		sites?: {
			[ key: number ]: {
				tpv?: number;
				payout?: number;
			};
		};
	};
	estimated?: {
		payout: number;
		tpv: number;
	};
}
