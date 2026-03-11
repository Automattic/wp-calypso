declare global {
	interface Window {
		_currentSiteId?: number;
		currentBlogId?: number;
		wpcomGutenberg?: {
			blogId?: number;
		};
		wpcomGutenbergRTC?: {
			providers: string[];
		};
	}
}

export {};
