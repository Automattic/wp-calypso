import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

export type TimeframeValue = '7_days' | '24_hours' | '30_days' | 'custom';

export interface TimeframeOption {
	label: string;
	value: TimeframeValue;
}

export interface ReportFormData {
	managed_site_id: number;
	timeframe: TimeframeValue;
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
	id: number;
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
	selectedTimeframe: TimeframeValue;
	clientEmail: string;
	startDate?: string;
	endDate?: string;
	sendCopyToTeam: boolean;
	teammateEmails: string;
	customIntroText: string;
	statsCheckedItems: BuildReportCheckedItemsState;
};

export interface ReportError extends Error {
	data: {
		status: number;
		message: string;
	};
}

export interface UseDuplicateReportFormDataHandlers {
	setSelectedTimeframe: ( value: TimeframeValue ) => void;
	setSelectedSite: ( site: A4ASelectSiteItem | null ) => void;
	setClientEmail: ( value: string ) => void;
	setCustomIntroText: ( value: string ) => void;
	setSendCopyToTeam: ( value: boolean ) => void;
	setTeammateEmails: ( value: string ) => void;
	setStartDate: ( value: string | undefined ) => void;
	setEndDate: ( value: string | undefined ) => void;
	setStatsCheckedItems: ( value: BuildReportCheckedItemsState ) => void;
}

export interface UseDuplicateReportFormDataReturn {
	formData: BuildReportFormData;
	handlers: UseDuplicateReportFormDataHandlers;
	isLoading: boolean;
	isDuplicating: boolean;
	error: Error | null;
}

export interface BuildReportState {
	sendReportMutation: { isPending: boolean };
	reportId: number | null;
	isDuplicateLoading: boolean;
	isReportPending: boolean;
	isReportError: boolean;
	isReportErrorStatus: boolean;
	isProcessed: boolean;
	showValidationErrors: boolean;
	validationErrors: Array< { field: string; message: string } >;
}
