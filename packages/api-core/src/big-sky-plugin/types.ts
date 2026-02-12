export interface BigSkyPluginMetadata {
	isOnboarded?: boolean;
	siteDescription?: string;
	topic?: string;
	siteTitle?: string;
}

export interface BigSkyPluginUpdateRequest {
	enable: boolean;
}

export interface BigSkyPluginResponse {
	blog_id: number;
	enabled: boolean;
	available: boolean;
	on_free_trial: boolean;
	metadata?: BigSkyPluginMetadata;
}
