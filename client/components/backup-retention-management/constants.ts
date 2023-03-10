import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';

export const RETENTION_OPTIONS = [ 7, 30, 120, 365 ] as RetentionPeriod[];

export const STORAGE_ESTIMATION_ADDITIONAL_BUFFER = 0;

export const STORAGE_RETENTION_LEARN_MORE_LINK =
	'https://jetpack.com/support/backup/#how-is-storage-usage-calculated';
