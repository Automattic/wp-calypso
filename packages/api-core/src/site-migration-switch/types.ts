export type SwitchRunState =
	| 'analysis_queued'
	| 'analyzing'
	| 'analysis_ready'
	| 'attaching'
	| 'attached'
	| 'failed'
	| 'expired'
	| 'completed';

/** States a switch run never leaves, so polling can stop for good. */
export const SWITCH_RUN_TERMINAL_STATES: readonly SwitchRunState[] = [
	'failed',
	'expired',
	'completed',
];

/** States in which the analysis poll can stop: it is ready, or it will never be. */
export const SWITCH_RUN_ANALYSIS_SETTLED_STATES: readonly SwitchRunState[] = [
	'analysis_ready',
	'attaching',
	'attached',
	...SWITCH_RUN_TERMINAL_STATES,
];

export interface SwitchRunMetrics {
	files: number;
	bytes: number;
}

export interface SwitchRunRecommendation {
	strategy: string;
	confidence: 'low' | 'medium' | 'high';
	reasons: string[];
}

export interface SwitchRunAnalysisSite {
	title: string;
	host: string;
	favicon?: string;
}

export interface SwitchRunAnalysisFinding {
	key: string;
	label: string;
	detail: string;
	ok: boolean;
}

export interface SwitchRunAnalysisVerdict {
	level: 'complete' | 'partial';
	text: string;
}

export interface SwitchRunAnalysisCounts {
	pages: number;
	posts: number;
	images: number;
}

export interface SwitchRunAnalysis {
	site: SwitchRunAnalysisSite;
	findings: SwitchRunAnalysisFinding[];
	verdict: SwitchRunAnalysisVerdict;
	counts: SwitchRunAnalysisCounts;
}

export interface SwitchRun {
	run_id: string;
	state: SwitchRunState;
	created_at: string;
	updated_at: string;
	expires_at: string;
	metrics?: SwitchRunMetrics;
	recommendation?: SwitchRunRecommendation;
	/** Present from `analysis_ready` onwards. */
	analysis?: SwitchRunAnalysis;
	/** `state: 'failed'` only. */
	error?: string;
	/** `state: 'attached'` only. */
	session_id?: string;
}

export type SwitchRunPreviewState = 'building' | 'ready' | 'failed';

export const SWITCH_RUN_PREVIEW_TERMINAL_STATES: readonly SwitchRunPreviewState[] = [
	'ready',
	'failed',
];

export interface SwitchRunPreviewMatchCount {
	matched: number;
	total: number;
}

export interface SwitchRunPreviewMatch {
	layout: boolean;
	fonts: boolean;
	images: SwitchRunPreviewMatchCount;
	pages: SwitchRunPreviewMatchCount;
}

export interface SwitchRunPreview {
	state: SwitchRunPreviewState;
	/** Present at `state: 'ready'`. */
	preview_url?: string;
	source_url?: string;
	match?: SwitchRunPreviewMatch;
}

/**
 * The underlying import record's status. Legacy: drive the UI from `state`.
 *
 * Until a destination is bound there is no import record and this is the
 * constant `new`, carrying no information. It only starts moving after
 * approval, and even then `state` says the same thing more precisely.
 */
export type StaticSiteImportStatus =
	| 'new'
	| 'processing'
	| 'queued'
	| 'running'
	| 'finished'
	| 'failed'
	| 'stopped'
	| 'expired';

/**
 * A session runs `capture_queued` → `capturing` → `building` → `preview_ready`,
 * then `queued` → `finished` once the user approves. `failed` is terminal from
 * anywhere.
 */
export type StaticSiteImportState =
	| 'capture_queued'
	| 'capturing'
	| 'building'
	| 'preview_ready'
	| 'queued'
	| 'finished'
	| 'failed';

/** The only states polling stops at; everything else keeps moving. */
export const STATIC_SITE_IMPORT_TERMINAL_STATES: readonly StaticSiteImportState[] = [
	'finished',
	'failed',
];

/**
 * What the build found, for the approval screen.
 *
 * Every field is optional. The API keeps a fixed set of counts from the build
 * report and drops anything it did not recognise, so a summary can arrive with
 * any subset of these — or empty.
 */
export interface StaticSiteImportPreviewSummary {
	pages?: number;
	documents?: number;
	blocks?: number;
	fallback_blocks?: number;
	content_loss?: number;
	invalid_blocks?: number;
	unsafe_svgs?: number;
	semantic_parity_failures?: number;
	diagnostics?: {
		total?: number;
		error?: number;
		warning?: number;
		notice?: number;
		info?: number;
	};
	theme?: string;
	quality_pass?: boolean;
	fail_import?: boolean;
}

/** How a session ended. Present once it reaches `finished` or `failed`. */
export interface StaticSiteImportReceipt {
	success: boolean;
	/** The failure's code. Absent on success. */
	code?: string;
}

export interface StaticSiteImportSession {
	session_id: string;
	status: StaticSiteImportStatus;
	state: StaticSiteImportState;
	source_digest: string;
	preview_summary?: StaticSiteImportPreviewSummary;
	/** Only meaningful once the import has been delivered to a site. */
	site_url: string;
	/** Present from `preview_ready` onwards; must be echoed back to `/approve`. */
	archive_hash?: string;
	/** Present at `state: 'finished'` and `state: 'failed'`. */
	receipt?: StaticSiteImportReceipt;
}

/**
 * The error codes the session API returns that the UI has to tell apart.
 *
 * Most of these share a 409, so the status code on its own says nothing useful
 * and the message has to be chosen from the code. Which call each one can come
 * back from matters: creating a session names no site, so everything about a
 * destination can only be reported at approval.
 */
export const STATIC_SITE_IMPORT_ERROR_CODES = {
	/** Approve: the destination site already has an import running. */
	IMPORT_EXISTS: 'import_exists',
	/** Create: this user is already at the cap on live sessions. */
	SESSION_LIMIT_EXCEEDED: 'static_site_import_session_limit_exceeded',
	/** Approve: the destination cannot become an Atomic site, so there is nowhere to deliver to. */
	ATOMIC_UNAVAILABLE: 'static_site_import_atomic_unavailable',
	/** Approve: the session is not at a point where it can be approved. */
	NOT_APPROVABLE: 'static_site_import_not_approvable',
	/** Approve: the session already named a different destination. */
	ALREADY_APPROVED: 'static_site_import_session_already_approved',
	/** Approve: the built archive changed since the summary the user approved was read. */
	ARCHIVE_MISMATCH: 'static_site_import_archive_mismatch',
	/** Either call: this user or site may not import content. */
	BLOCKED: 'static_site_import_blocked',
	/** Either call: the feature is not open to this user. */
	DISABLED: 'static_site_import_disabled',
	/** No such session, or it belongs to somebody else. */
	SESSION_NOT_FOUND: 'static_site_import_session_not_found',
	/** Create: the source URL is not a public HTTPS address we can read. */
	INVALID_SOURCE_URL: 'invalid_static_site_source_url',
} as const;

export interface AttachSwitchRunParams {
	runId: string;
	destinationBlogId: number;
}

export interface ApproveStaticSiteImportSessionParams {
	sessionId: string;
	archiveHash: string;
	/**
	 * The session is user-scoped up to this point; approval is what picks the site
	 * the build gets delivered to.
	 */
	destinationBlogId: number;
}
