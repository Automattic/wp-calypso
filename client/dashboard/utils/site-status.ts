import type { SiteMigrationStatus } from '../types';
import type { Site, SiteBlockingStatus } from '@automattic/api-core';

const MIGRATION_STATUSES: SiteMigrationStatus[ 'status' ][] = [ 'pending', 'started', 'completed' ];
const MIGRATION_TYPES: SiteMigrationStatus[ 'type' ][] = [ 'difm', 'diy', 'ssh' ];

export function getSiteBlockingStatus( item: Site ): SiteBlockingStatus {
	if ( item.is_deleted ) {
		return 'deleted';
	}

	const { migration_status } = item.site_migration;
	if ( migration_status?.startsWith( 'migration-pending' ) ) {
		return 'migration_pending';
	}
	if (
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

export function isSiteMigrationInProgress( item: Site ) {
	const { status } = getSiteMigrationState( item ) ?? {};
	if ( ! status ) {
		return false;
	}

	return [ 'pending', 'started' ].includes( status );
}
