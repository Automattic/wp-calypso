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

export interface CommissionIneligibleSite {
	blog_id: number;
	ineligible_reason: string;
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
			sites?: {
				[ key: number ]: WooPaymentsDataObject;
			};
			current_quarter: WooPaymentsDataObject & {
				sites?: {
					[ key: number ]: {
						tpv?: number;
						payout?: number;
						transactions?: number;
					};
				};
			};
			previous_quarter: WooPaymentsDataObject & {
				sites?: {
					[ key: number ]: {
						tpv?: number;
						payout?: number;
						transactions?: number;
					};
				};
			};
		};
		commission_eligible_sites?: Array< number >;
		commission_ineligible_sites?: Array< CommissionIneligibleSite >;
	};
	status: string;
}
