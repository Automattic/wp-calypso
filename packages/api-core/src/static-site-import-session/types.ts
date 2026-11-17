export type StaticSiteImportState =
	'capture_queued' | 'capturing' | 'building' | 'preview_ready' | 'queued' | 'finished' | 'failed';

export const STATIC_SITE_IMPORT_TERMINAL_STATES: readonly StaticSiteImportState[] = [
	'finished',
	'failed',
];

export type StaticSiteImportCapability =
	| 'booking'
	| 'commerce'
	| 'dialogs'
	| 'embeds'
	| 'events'
	| 'forms'
	| 'media'
	| 'membership'
	| 'navigation';

export type StaticSiteImportBand = 'simple' | 'moderate' | 'complex' | 'unknown';

/** A count inspection took on the pages it sampled, e.g. `{ code: 'images', value: 6 }`. */
export interface StaticSiteImportFactor {
	code: 'pages' | 'images' | 'embeds' | 'elements' | ( string & {} );
	value: number;
}

export interface StaticSiteImportInspection {
	measured: boolean;
	factors?: StaticSiteImportFactor[];
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
	/** Pages the source has that the build left out. */
	routes_omitted?: number;
	images_missing_source?: number;
	unresolved_internal_links?: number;
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

/** Where wpcom is in restoring the built site onto its destination. */
export type StaticSiteImportDeliveryStage =
	| 'preparing'
	| 'convert_to_atomic'
	| 'download_archive'
	| 'unpack_file'
	| 'preprocess'
	| 'process_files'
	| 'recreate_database'
	| 'postprocess_database'
	| 'verify_site_integrity'
	| 'clean_up';

/** The restore onto the destination, while the session is `queued` with one. */
export interface StaticSiteImportDelivery {
	stage: StaticSiteImportDeliveryStage;
	/** 0 while preparing, then 1 to `total_steps` in the order of the stages. Stages can be skipped. */
	step: number;
	total_steps: number;
	/** When wpcom first saw the stage, in Unix seconds. */
	stage_started_at: number;
	/** When the destination was approved, in Unix seconds. */
	started_at?: number;
	/** When the restore reached the site, in Unix seconds. */
	restore_started_at?: number;
	/** The files copied so far, from `process_files` on. */
	files?: { done: number; total: number };
}

export interface StaticSiteImportProgress {
	/** Present only while the built site is being restored onto its destination. */
	delivery?: StaticSiteImportDelivery;
	phase?: 'installing' | 'inspecting' | 'capturing' | 'comparing' | 'building' | 'exporting';
	/** When the server first saw the current phase, in Unix seconds. */
	phase_started_at?: number;
	/** Capture is still discovering the source's pages. */
	finding_pages?: boolean;
	/** The path of the page capture saved last, percent-encoded, e.g. `/about-us/`. */
	current_page?: string;
	/** Every page is captured, and capture is saving the site's images, then its files. */
	capture_stage?: 'media' | 'finalizing';
	/** The inspection before capture: `pages_found` is how many pages it saw, before capture settles on a total. */
	source?: { complexity?: string; pages_found?: number; issues?: number };
	/** What capture saved, once it finishes. */
	captured?: { files?: number; bytes?: number };
	/** How long each finished step took, in seconds. */
	step_seconds?: Partial< Record< 'inspecting' | 'capturing' | 'comparing', number > >;
	/**
	 * The importer's build step while the site is built, e.g. `compile_pages`, and its pages done of
	 * the total. Absent before the importer starts and on servers that don't report it.
	 */
	building?: { stage: string; current: number; total: number };
	pages_captured?: number;
	pages_total?: number;
}

export interface StaticSiteImportSession {
	session_id: string;
	/** Legacy import record status; drive the UI from `state`. */
	status: string;
	state: StaticSiteImportState;
	progress?: StaticSiteImportProgress;
	source_digest: string;
	/** PHP serialises an empty summary as `[]`. */
	preview_summary: StaticSiteImportPreviewSummary | [];
	/** What inspection found on the source before capture, or null until it has run. */
	assessment?: StaticSiteImportInspection | null;
	/** A short-lived link to a screenshot of the source's home page, once capture has taken it. */
	preview_image_url?: string;
	/** Empty until approval binds a destination. */
	site_url: string;
	/**
	 * What the move found on the old site that may need our team, translated for the reader, e.g.
	 * "We found a store on example.com." The ready email carries the same sentence. '' when there is
	 * nothing to say.
	 */
	review_note?: string;
	/** The source domain the customer can connect, or '' for a builder's free address or an upload. */
	connectable_domain: string;
	/** Present from `preview_ready`. */
	archive_hash?: string;
	/** A short-lived link to the preview's Playground archive, only while `preview_ready`. */
	archive_url?: string;
	receipt?: { success: boolean; code?: string };
}

export interface ApproveStaticSiteImportSessionParams {
	sessionId: string;
	destinationBlogId: number;
}

export interface StaticSiteImportHandoffParams {
	blogUrl: string;
	fromUrl: string;
	locale: string;
	/** The move being handed over, so the ticket can say what it found. */
	importSessionId?: string;
}
