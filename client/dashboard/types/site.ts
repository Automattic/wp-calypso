export interface SiteMigrationStatus {
	status: 'pending' | 'started' | 'completed';
	type: 'difm' | 'diy' | 'ssh';
}

export type SiteVisibility = 'public' | 'private' | 'coming_soon';

export type SiteBlockingStatus =
	| 'deleted'
	| 'migration_pending'
	| 'migration_started'
	| 'difm_lite_in_progress'
	| null;

export type SiteBadge = 'staging' | 'trial' | 'p2' | SiteBlockingStatus;
