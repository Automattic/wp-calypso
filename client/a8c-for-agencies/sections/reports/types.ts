import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

export interface ReportFormData {
	managed_site_id: number;
	timeframe: string;
	client_emails: string[];
	start_date?: string;
	end_date?: string;
	send_copy_to_team: boolean;
	teammate_emails: string[];
	custom_intro_text: string;
	stats_items: BuildReportCheckedItemsState;
}

export interface ReportFormAPIResponse extends ReportFormData {
	managed_site_url: string;
	blog_id: number;
}
export interface Report {
	id: string;
	status: 'sent' | 'error' | 'pending';
	created_at: number;
	data: ReportFormAPIResponse;
}

export type ReportStatus = 'sent' | 'error' | 'pending' | 'processed';

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
	sendCopyToTeam: boolean;
	teammateEmails: string;
	customIntroText: string;
	statsCheckedItems: BuildReportCheckedItemsState;
};
