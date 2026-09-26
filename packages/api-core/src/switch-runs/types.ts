export type SwitchRunState =
	| 'analysis_queued'
	| 'analyzing'
	| 'analysis_ready'
	| 'attaching'
	| 'attached'
	| 'failed'
	| 'expired'
	| 'completed';

export type SwitchRunStrategy = 'ssi' | 'blueprint';

export type SwitchRunError = {
	code?: string;
	message?: string;
};

export type SwitchRunMetrics = {
	files?: number;
	bytes?: number;
};

export type SwitchRunRecommendation = {
	strategy: SwitchRunStrategy;
	confidence: 'low' | 'medium' | 'high';
	reasons: string[];
};

export type SwitchRun = {
	run_id: string;
	state: SwitchRunState;
	created_at?: string;
	updated_at?: string;
	expires_at?: string;
	metrics?: SwitchRunMetrics;
	recommendation?: SwitchRunRecommendation;
	error?: SwitchRunError | string;
	session_id?: string;
};

export type CreateSwitchRunRequest = {
	source_url: string;
};

export type AttachSwitchRunRequest = {
	destination_blog_id: number;
};
