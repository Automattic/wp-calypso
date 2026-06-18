export type AmplifyMode = 'human' | 'ai' | 'fullanalysis';

export type AmplifyJobStatus = 'pending' | 'failed';

// In-flight or failed run, surfaced by GET /jobs. `failure_reason` is present
// only when `status` is `failed`.
export interface AmplifyJob {
	id: string;
	status: AmplifyJobStatus;
	url: string;
	mode: AmplifyMode;
	timestamp: string;
	failure_reason?: string;
}

// `fullanalysis` fills both lenses; a single-lens run fills its own and leaves
// the other `null`.
export interface AmplifyScore {
	human: number | null;
	ai: number | null;
}

// Finished, scored run, surfaced by GET /reports and GET /reports/{id}. A
// report's `id` differs from the originating run's id.
export interface AmplifyReport {
	id: string;
	status: 'completed';
	url: string;
	agency_name: string;
	mode: AmplifyMode;
	timestamp: string;
	user_id: number | null;
	score: AmplifyScore;
	pdf_url: string | null;
}

export interface AmplifyJobsResponse {
	jobs: AmplifyJob[];
}

export interface AmplifyReportsResponse {
	reports: AmplifyReport[];
}

export interface StartAmplifyAnalysisParams {
	url: string;
	mode: AmplifyMode;
}

// 202 response from POST /reports — the newly created run, always `pending`.
export interface AmplifyAnalysisRun {
	id: string;
	status: 'pending';
	url: string;
	mode: AmplifyMode;
	timestamp: string;
}

export interface AmplifyApiError {
	status: number;
	code: string | null;
	message: string;
}
