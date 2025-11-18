export interface BigSkyPluginMetadata {
	isOnboarded?: boolean;
	siteDescription?: string;
	topic?: string;
	siteTitle?: string;
}

export interface BigSkyPluginUpdateRequest {
	enable: boolean;
	site_description?: string;
	topic?: string;
	site_title?: string;
}

export interface BigSkyPluginResponse {
	blog_id: number;
	enabled: boolean;
	metadata?: BigSkyPluginMetadata;
}
