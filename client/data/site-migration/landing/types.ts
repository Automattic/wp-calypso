export enum MigrationStatus {
	PENDING = 'migration-pending',
	// Do it for me
	PENDING_DIFM = 'migration-pending-difm',
	STARTED_DIFM = 'migration-started-difm',
	// Do it yourself
	PENDING_DYFM = 'migration-pending-dyfm',
	STARTED_DYFM = 'migration-started-dyfm',
}
