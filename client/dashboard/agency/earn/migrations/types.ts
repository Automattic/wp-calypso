import type { MigrationCommissionSite } from '@automattic/api-core';
import type { ReactNode } from 'react';

/**
 * @deprecated Prefer importing `MigrationCommissionSite` from `@automattic/api-core`.
 * Kept as an alias so existing imports across the migrations section keep working.
 */
export type TaggedSite = MigrationCommissionSite;

export type RecordTracksEvent = ( name: string, properties?: Record< string, unknown > ) => void;

export type ShowSuccessNotice = (
	message: ReactNode,
	options?: { id?: string; duration?: number }
) => void;
