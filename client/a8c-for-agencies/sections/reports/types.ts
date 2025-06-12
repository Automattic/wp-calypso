export interface Report {
	id: string;
	site: string;
	status: 'sent' | 'error';
	created_at: string;
}

export interface SiteReports {
	site: string;
	reports: Report[];
	totalReports: number;
	latestReport: Report;
}

export interface ReportsApiResponse {
	data: Report;
	status: 'sent' | 'error';
}

export type BuildReportCheckedItemsState = Record< string, boolean >;

export type BuildReportFormData = {
	selectedSite: string;
	selectedTimeframe: string;
	clientEmail: string;
	startDate?: string;
	endDate?: string;
	sendMeACopy: boolean;
	teammateEmails: string;
	customIntroText: string;
	statsCheckedItems: BuildReportCheckedItemsState;
};
