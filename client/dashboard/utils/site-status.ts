import config from '@automattic/calypso-config';
import type { SiteBlockingStatus, SiteMigrationStatus } from '../types';
import type { Site } from '@automattic/api-core';

const MIGRATION_STATUSES: SiteMigrationStatus[ 'status' ][] = [ 'pending', 'started', 'completed' ];
const MIGRATION_TYPES: SiteMigrationStatus[ 'type' ][] = [ 'difm', 'diy', 'ssh' ];

export function getSiteBlockingStatus( item: Site ): SiteBlockingStatus {
	if ( item.is_deleted ) {
		return 'deleted';
	}

	const { migration_status, status_v2 } = item.site_migration;
	if ( isWordPressMigration( item ) ) {
		// Goes by the same state as the lock, so the two can't disagree when the flow sticker lags.
		if ( isSiteMigrationInProgress( item ) ) {
			return status_v2 === 'pending' ? 'migration_pending' : 'migration_started';
		}
	} else if ( migration_status?.startsWith( 'migration-pending' ) ) {
		return 'migration_pending';
	} else if (
		migration_status?.startsWith( 'migration-started' ) ||
		migration_status?.startsWith( 'migration-in-progress' )
	) {
		return 'migration_started';
	}

	if ( item.options?.is_difm_lite_in_progress ) {
		return 'difm_lite_in_progress';
	}

	return null;
}

export function getSiteMigrationState( item: Site ): SiteMigrationStatus | null {
	const { migration_status } = item.site_migration;
	if ( migration_status === 'migration-in-progress' ) {
		return { status: 'started', type: 'difm' };
	}

	const [ , status, type ] = migration_status?.split( '-' ) ?? [];
	if ( ! MIGRATION_STATUSES.includes( status as SiteMigrationStatus[ 'status' ] ) ) {
		return null;
	}

	if ( ! MIGRATION_TYPES.includes( type as SiteMigrationStatus[ 'type' ] ) ) {
		return null;
	}

	if ( ! status || ! type ) {
		return null;
	}

	return {
		status: status as SiteMigrationStatus[ 'status' ],
		type: type as SiteMigrationStatus[ 'type' ],
	};
}

// A WordPress (Reprint) migration, which has its own views. Until the flow launches, these sites
// are treated as whatever their flow sticker says.
export function isWordPressMigration( item: Site ) {
	return config.isEnabled( 'migration/reprint-flow' ) && item.site_migration.type === 'wordpress';
}

export function isSiteMigrationInProgress( item: Site ) {
	// A WordPress (Reprint) migration reports its own state. The others still go by their flow sticker.
	if ( isWordPressMigration( item ) ) {
		return item.site_migration.status_v2 !== 'completed';
	}

	const { status } = getSiteMigrationState( item ) ?? {};
	if ( ! status ) {
		return false;
	}

	return [ 'pending', 'started' ].includes( status );
}
