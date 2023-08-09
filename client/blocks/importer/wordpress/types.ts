export enum WPImportOption {
	EVERYTHING = 'everything',
	CONTENT_ONLY = 'content',
}

export enum MigrationStatus {
	UNKNOWN = 'unknown',
	INACTIVE = 'inactive',
	NEW = 'new',
	BACKING_UP = 'backing-up',
	RESTORING = 'restoring',
	DONE = 'done',
	ERROR = 'error',
}

export enum WPImportError {
	WPRESS_FILE_IS_NOT_SUPPORTED = 'wpress-file-is-not-supported',
}

export enum FileTooLarge {
	FILE_TOO_LARGE = 'file-too-large',
}
