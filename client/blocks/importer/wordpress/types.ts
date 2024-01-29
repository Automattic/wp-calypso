import { MigrationStatus, MigrationStatusError } from '@automattic/data-stores';

export enum WPImportOption {
	EVERYTHING = 'everything',
	CONTENT_ONLY = 'content',
}

export enum WPImportError {
	WPRESS_FILE_IS_NOT_SUPPORTED = 'wpress-file-is-not-supported',
}

export enum FileTooLarge {
	FILE_TOO_LARGE = 'file-too-large',
}

export interface MigrationState {
	migrationStatus: MigrationStatus;
	migrationErrorStatus: MigrationStatusError;
	percent: number | null;
	siteSize: number | null;
	backupPercent: number | null;
	backupMedia: number | null;
	backupPosts: number | null;
	restorePercent: number | null;
	restoreMessage: string | null;
	step: number | null;
	stepTotal: number | null;
	stepName: string | RestoreStepName | null;
}

export type RestoreStepName =
	| 'restore_start'
	| 'checking_remote_files'
	| 'verifying_backup_configurations'
	| 'streaming_files'
	| 'preparing_database'
	| 'checking_symlinks'
	| 'parsing_manifest'
	| 'restoring_database'
	| 'done';
