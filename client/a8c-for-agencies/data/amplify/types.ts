export type AmplifyMode = 'human' | 'ai' | 'full';

export type AmplifyReportStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// `full` fills both lenses; a single-lens run fills its own and leaves the
// other `null`. Both are `null` until the analysis completes.
export interface AmplifyScore {
	human: number | null;
	ai: number | null;
}

// A report as surfaced by the unified `/reports` routes. Every run lives on
// the one collection through its whole life, its `status` telling you where
// it is: `pending` (analysis queued, waiting to start), `in_progress`
// (analysis running), `completed` (`score` populated, `pdf_url` set) or
// `failed` (`failure_reason` carries a short reason). `id` is the numeric post id as a string.
export interface AmplifyReport {
	id: string;
	status: AmplifyReportStatus;
	url: string;
	mode: AmplifyMode;
	created_at: string | null;
	updated_at: string | null;
	user_id: number;
	score: AmplifyScore;
	pdf_url: string | null;
	archived: boolean;
	failure_reason: string | null;
}

export interface AmplifyReportsResponse {
	reports: AmplifyReport[];
}

export interface StartAmplifyAnalysisParams {
	url: string;
	mode: AmplifyMode;
}

export interface ArchiveAmplifyReportParams {
	reportId: string;
}

export interface AmplifyApiError {
	status: number;
	code: string | null;
	message: string;
}
