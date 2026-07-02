interface AgencyWooPaymentsFigures {
	payout: number;
	tpv: number;
	transactions: number;
}

type AgencyWooPaymentsPerSite = {
	[ blogId: number ]: {
		tpv?: number;
		payout?: number;
		transactions?: number;
	};
};

export interface AgencyWooPaymentsIneligibleSite {
	blog_id: number;
	ineligible_reason: string;
}

export interface AgencyWooPaymentsData {
	data: {
		total?: AgencyWooPaymentsFigures & { sites?: AgencyWooPaymentsPerSite };
		estimated?: AgencyWooPaymentsFigures & {
			sites?: AgencyWooPaymentsPerSite;
			current_quarter: AgencyWooPaymentsFigures & { sites?: AgencyWooPaymentsPerSite };
			previous_quarter: AgencyWooPaymentsFigures & { sites?: AgencyWooPaymentsPerSite };
		};
		commission_eligible_sites?: number[];
		commission_ineligible_sites?: AgencyWooPaymentsIneligibleSite[];
	};
	status: string;
}

// Normalized site row used by the dashboard table.
export interface AgencyWooPaymentsSiteState {
	blogId: number;
	siteUrl: string;
	state: string;
}

export interface AgencyWooPaymentsReport {
	data: string;
	filename: string;
}
