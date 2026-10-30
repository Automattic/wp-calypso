export type AmplifyMode = 'human' | 'ai' | 'full';

export type AmplifyReportStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface AmplifyReport {
	id: string;
	status: AmplifyReportStatus;
	url: string;
	site_title?: string | null;
	mode: AmplifyMode;
	created_at: string | null;
	updated_at: string | null;
	user_id: number | null;
	score: { human: number | null; ai: number | null };
	/** @deprecated Download through `fetchAmplifyReportPdf` instead. Will be removed. */
	pdf_url: string | null;
	has_pdf: boolean;
	archived: boolean;
	failure_reason: string | null;
}

export interface AmplifyUsage {
	/** Reports created this calendar month (UTC), failed and archived included. Retries don't count. */
	used: number;
	/** The monthly allowance, including any extra reports. `null` means no limit. */
	limit: number | null;
	resets_at: string;
}

export interface AmplifyReportsResponse {
	reports: AmplifyReport[];
	usage?: AmplifyUsage;
}

export interface AmplifyReportPdf {
	filename: string;
	/** The PDF, base64-encoded. */
	data: string;
}

export interface StartAmplifyReportInput {
	url: string;
	mode: AmplifyMode;
}
