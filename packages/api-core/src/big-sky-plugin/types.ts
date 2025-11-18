export interface BigSkyPluginMetadata {
	isOnboarded?: boolean;
	siteDescription?: string;
	topic?: string;
	siteTitle?: string;
}

export interface BigSkyPluginUpdateRequest {
	enable: boolean;
	metadata?: BigSkyPluginMetadata;
}

export interface BigSkyPluginResponse {
	blog_id: number;
	enabled: boolean;
	metadata?: BigSkyPluginMetadata;
}
