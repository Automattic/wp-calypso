import type { SendReportEmailParams } from './hooks/use-send-report-email-mutation';
import type { UseMutationResult } from '@tanstack/react-query';
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

export type ReportStatus = 'sent' | 'error' | 'pending' | 'processed';

export interface Report {
	id: number;
	status: ReportStatus;
	created_at: number;
	data: ReportFormAPIResponse;
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

export interface APIError {
	status: number;
	code: string;
	message: string;
}

export interface SendReportResponse {
	id: string;
	status: 'sent' | 'error' | 'pending';
	message: string;
}
export interface SendReportEmailResponse {
	success: boolean;
	message: string;
}

export interface BuildReportState {
	sendReportMutation: UseMutationResult<
		SendReportResponse,
		APIError,
		BuildReportFormData,
		unknown
	>;
	sendReportEmailMutation: UseMutationResult<
		SendReportEmailResponse,
		APIError,
		SendReportEmailParams,
		unknown
	>;
	reportId: number | null;
	isDuplicateLoading: boolean;
	isReportPending: boolean;
	isReportError: boolean;
	isReportErrorStatus: boolean;
	isProcessed: boolean;
	showValidationErrors: boolean;
	validationErrors: Array< { field: string; message: string } >;
}
