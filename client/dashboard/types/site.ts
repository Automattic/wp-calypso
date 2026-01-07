export type SiteStatus =
	| 'deleted'
	| 'migration_pending'
	| 'migration_started'
	| 'difm_lite_in_progress'
	| null;

export type SiteBadge = SiteStatus | 'staging' | 'p2' | 'trial' | null;

export interface SiteMigrationStatus {
	status: 'pending' | 'started' | 'completed';
	type: 'difm' | 'diy' | 'ssh';
}
