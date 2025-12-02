export type SiteResetContentSummary = {
	post_count: number;
	page_count: number;
	media_count: number;
	plugin_count: number;
};

export type SiteResetStatus = {
	status: 'in-progress' | 'ready' | 'completed';
	progress: number;
};
