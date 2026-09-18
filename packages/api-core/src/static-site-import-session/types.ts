export type StaticSiteImportState =
	| 'capture_queued'
	| 'capturing'
	| 'building'
	| 'preview_ready'
	| 'queued'
	| 'finished'
	| 'failed';

/** States polling can stop at: the session will never move on by itself. */
export const STATIC_SITE_IMPORT_TERMINAL_STATES: readonly StaticSiteImportState[] = [
	'finished',
	'failed',
];

/** States in which the capture is over: the preview is ready, or it never will be. */
export const STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES: readonly StaticSiteImportState[] = [
	'preview_ready',
	'queued',
	...STATIC_SITE_IMPORT_TERMINAL_STATES,
];

export interface StaticSiteImportDiagnostics {
	total?: number;
	error?: number;
	warning?: number;
	notice?: number;
	info?: number;
}

export interface StaticSiteImportInspection {
	measured: boolean;
	band?: 'simple' | 'moderate' | 'complex' | 'unknown';
	observed_band?: 'simple' | 'moderate' | 'complex' | 'unknown';
	confidence?: 'bounded-sample' | 'incomplete';
	routes?: number;
	sampled?: number;
	rendered?: number;
	unknowns?: number;
	issues?: number;
	capabilities?: Record< string, number >;
}

export interface StaticSiteImportFidelity {
	measured: boolean;
	pass?: boolean;
	routes_available?: number;
	routes_compared?: number;
	offline_routes?: number;
	offline_findings?: number;
	failed_checks?: number;
	cleanup_removed?: number;
}

/** The sandbox's build report. Every key is optional: the server drops unknown or invalid ones. */
export interface StaticSiteImportPreviewSummary {
	pages?: number;
	documents?: number;
	blocks?: number;
	fallback_blocks?: number;
	content_loss?: number;
	invalid_blocks?: number;
	unsafe_svgs?: number;
	semantic_parity_failures?: number;
	diagnostics?: StaticSiteImportDiagnostics;
	theme?: string;
	quality_pass?: boolean;
	fail_import?: boolean;
	inspection?: StaticSiteImportInspection;
	fidelity?: StaticSiteImportFidelity;
}

export interface StaticSiteImportReceipt {
	success: boolean;
	code?: string;
	[ key: string ]: unknown;
}

export interface StaticSiteImportSession {
	session_id: string;
	/** The underlying import record's status. Reads `new` until approval; drive the UI from `state`. */
	status: string;
	state: StaticSiteImportState;
	source_digest: string;
	preview_summary: StaticSiteImportPreviewSummary | [];
	/** Empty until a destination is bound, then the destination's URL. */
	site_url: string;
	/** sha-256 of the built site archive, from `preview_ready`. Echoed back to `/approve`. */
	archive_hash?: string;
	/** Present once the session is terminal. */
	receipt?: StaticSiteImportReceipt;
}

export interface ApproveStaticSiteImportSessionParams {
	sessionId: string;
	archiveHash: string;
	destinationBlogId: number;
}
