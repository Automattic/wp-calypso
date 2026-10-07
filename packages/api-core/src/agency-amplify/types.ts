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
	user_id: number;
	score: { human: number | null; ai: number | null };
	pdf_url: string | null;
	archived: boolean;
	failure_reason: string | null;
}

export interface AmplifyUsage {
	used: number;
	limit: number;
	resets_at: string;
	/** Per-agency cap set by a partner manager in Mission Control, when present. */
	override?: number | null;
}

export interface AmplifyReportsResponse {
	reports: AmplifyReport[];
	usage?: AmplifyUsage;
}

export interface StartAmplifyReportInput {
	url: string;
	mode: AmplifyMode;
}
