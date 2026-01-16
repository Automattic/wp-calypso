export interface SiteMigrationStatus {
	status: 'pending' | 'started' | 'completed';
	type: 'difm' | 'diy' | 'ssh';
}

export type SiteVisibility = 'public' | 'private' | 'coming_soon';
