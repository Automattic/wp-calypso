export type WPImportType = 'everything' | 'content_only';

export enum MigrationStatus {
	UNKNOWN = 'unknown',
	INACTIVE = 'inactive',
	NEW = 'new',
	BACKING_UP = 'backing-up',
	RESTORING = 'restoring',
	DONE = 'done',
	ERROR = 'error',
}
