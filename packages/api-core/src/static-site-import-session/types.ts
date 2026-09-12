export type StaticSiteImportState =
	| 'capture_queued'
	| 'capturing'
	| 'compiling'
	| 'preview_ready'
	| 'queued'
	| 'applying'
	| 'finished'
	| 'failed';

export type StaticSiteImportReceipt = {
	success: boolean;
	code?: string;
	schema_version?: number;
	posts?: number;
	pages?: number;
	media?: number;
	assets?: number;
	blocks?: number;
};

export type StaticSiteImportSession = {
	session_id: string;
	plan_hash?: string;
	status: string;
	state: StaticSiteImportState;
	source_digest?: string;
	preview_summary?: Record< string, number >;
	receipt?: StaticSiteImportReceipt;
};
