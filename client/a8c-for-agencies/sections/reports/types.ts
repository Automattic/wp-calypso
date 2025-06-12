import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

export interface ReportFormData {
	blog_id: number;
	timeframe: string;
	client_email: string[];
	start_date?: string;
	end_date?: string;
	send_copy_to_team: boolean;
	teammate_emails: string[];
	custom_intro_text: string;
	stats_items: BuildReportCheckedItemsState;
}
export interface Report {
	id: string;
	site: string;
	status: 'sent' | 'error' | 'pending';
	created_at: string;
	form_data: ReportFormData;
}

export interface SiteReports {
	site: string;
	reports: Report[];
	totalReports: number;
	latestReport: Report;
}

export interface ReportsApiResponse {
	data: Report;
	status: 'sent' | 'error' | 'pending';
}

export type BuildReportCheckedItemsState = Record< string, boolean >;

export type BuildReportFormData = {
	selectedSite: A4ASelectSiteItem | null;
	selectedTimeframe: string;
	clientEmail: string;
	startDate?: string;
	endDate?: string;
	sendMeACopy: boolean;
	teammateEmails: string;
	customIntroText: string;
	statsCheckedItems: BuildReportCheckedItemsState;
};
