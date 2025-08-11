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

interface WooPaymentsDataObject {
	payout: number;
	tpv: number;
	transactions: number;
}

export interface WooPaymentsData {
	data: {
		total?: WooPaymentsDataObject & {
			sites?: {
				[ key: number ]: {
					tpv?: number;
					payout?: number;
					transactions?: number;
				};
			};
		};
		estimated?: WooPaymentsDataObject & {
			current_quarter: WooPaymentsDataObject;
			previous_quarter: WooPaymentsDataObject;
		};
	};
	status: string;
}
