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

export type StaticSiteImportCapability =
	'booking' | 'commerce' | 'dialogs' | 'embeds' | 'forms' | 'media' | 'membership' | 'navigation';

export type StaticSiteImportBand = 'simple' | 'moderate' | 'complex' | 'unknown';

export interface StaticSiteImportInspection {
	measured: boolean;
	error?: string;
	band?: StaticSiteImportBand;
	observed_band?: StaticSiteImportBand;
	confidence?: 'bounded-sample' | 'incomplete';
	routes?: number;
	sampled?: number;
	rendered?: number;
	unknowns?: number;
	issues?: number;
	/** The most of each capability found on any one sampled page. */
	capabilities?: Partial< Record< StaticSiteImportCapability, number > >;
}

export interface StaticSiteImportFidelity {
	measured: boolean;
	error?: string;
	pass?: boolean;
	routes_available?: number;
	routes_compared?: number;
	failed_checks?: number;
	routes_failed?: number;
	checks?: { route: string; failures: string[] }[];
}

export interface StaticSiteImportPreviewSummary {
	pages?: number;
	documents?: number;
	blocks?: number;
	fallback_blocks?: number;
	content_loss?: number;
	invalid_blocks?: number;
	semantic_parity_failures?: number;
	theme?: string;
	quality_pass?: boolean;
	fail_import?: boolean;
	inspection?: StaticSiteImportInspection;
	fidelity?: StaticSiteImportFidelity;
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
	/** A short-lived link to the preview's Playground archive, only while `preview_ready`. */
	archive_url?: string;
	receipt?: { success: boolean; code?: string };
}

export interface ApproveStaticSiteImportSessionParams {
	sessionId: string;
	archiveHash: string;
	destinationBlogId: number;
}
