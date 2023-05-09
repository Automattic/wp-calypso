export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

export type FeatureId =
	| 'domain'
	| 'store'
	| 'seo'
	| 'plugins'
	| 'ad-free'
	| 'image-storage'
	| 'video-storage'
	| 'support';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}
