export enum MigrationStatus {
	UNKNOWN = 'unknown',
	INACTIVE = 'inactive',
	NEW = 'new',
	BACKING_UP = 'backing-up',
	RESTORING = 'restoring',
	DONE = 'done',
	ERROR = 'error',
}

export enum WPImportOption {
	EVERYTHING = 'everything',
	CONTENT_ONLY = 'content',
}

export enum MigrationStep {
	INPUT = 'input',
	UPGRADE = 'upgrade',
	CONFIRM = 'confirm',
	MIGRATE_OR_IMPORT = 'migrateOrImport',
}
