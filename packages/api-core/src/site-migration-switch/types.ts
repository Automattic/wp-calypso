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

export type StaticSiteImportStatus = 'new' | 'queued' | 'running' | 'finished' | 'failed';

export type StaticSiteImportState =
	| 'capture_queued'
	| 'capturing'
	| 'compiling'
	| 'preview_ready'
	| 'queued'
	| 'applying'
	| 'finished'
	| 'failed';

/** The only states polling stops at; everything else keeps moving. */
export const STATIC_SITE_IMPORT_TERMINAL_STATES: readonly StaticSiteImportState[] = [
	'finished',
	'failed',
];

export interface StaticSiteImportPreviewSummary {
	posts: number;
	pages: number;
	media: number;
	assets: number;
	blocks: number;
}

export interface StaticSiteImportSession {
	session_id: string;
	status: StaticSiteImportStatus;
	state: StaticSiteImportState;
	source_digest: string;
	preview_summary?: StaticSiteImportPreviewSummary;
	site_url: string;
	/** Present at `state: 'preview_ready'`; must be echoed back to `/approve`. */
	plan_hash?: string;
	/** Present at `state: 'finished'`. */
	receipt?: Record< string, unknown >;
}

export interface AttachSwitchRunParams {
	runId: string;
	destinationBlogId: number;
}

export interface ApproveStaticSiteImportSessionParams {
	siteId: number;
	sessionId: string;
	planHash: string;
}
