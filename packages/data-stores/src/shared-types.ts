export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

declare global {
	interface Window {
		_currentSiteId: number;
	}
}
