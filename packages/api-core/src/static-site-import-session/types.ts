export type StaticSiteImportState =
	'capture_queued' | 'capturing' | 'building' | 'preview_ready' | 'queued' | 'finished' | 'failed';

export const STATIC_SITE_IMPORT_TERMINAL_STATES: readonly StaticSiteImportState[] = [
	'finished',
	'failed',
];

export const STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES: readonly StaticSiteImportState[] = [
	'preview_ready',
	'queued',
	...STATIC_SITE_IMPORT_TERMINAL_STATES,
];

export interface StaticSiteImportPreviewSummary {
	pages?: number;
	quality_pass?: boolean;
}

export interface StaticSiteImportSession {
	session_id: string;
	/** Legacy import record status; drive the UI from `state`. */
	status: string;
	state: StaticSiteImportState;
	source_digest: string;
	/** PHP serialises an empty summary as `[]`. */
	preview_summary: StaticSiteImportPreviewSummary | [];
	/** Empty until approval binds a destination. */
	site_url: string;
	/** Present from `preview_ready`; echoed back to `/approve`. */
	archive_hash?: string;
	receipt?: { success: boolean; code?: string };
}

export interface ApproveStaticSiteImportSessionParams {
	sessionId: string;
	archiveHash: string;
	destinationBlogId: number;
}
