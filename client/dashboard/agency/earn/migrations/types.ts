import type { MigrationCommissionSite } from '@automattic/api-core';

/**
 * @deprecated Prefer importing `MigrationCommissionSite` from `@automattic/api-core`.
 * Kept as an alias so existing imports across the migrations section keep working.
 */
export type TaggedSite = MigrationCommissionSite;

export type RecordTracksEvent = ( name: string, properties?: Record< string, unknown > ) => void;

// Dashboard snackbars accept string content only, so notice callbacks are
// narrowed to strings across both hosts.
export type ShowSuccessNotice = (
	message: string,
	options?: { id?: string; duration?: number }
) => void;
