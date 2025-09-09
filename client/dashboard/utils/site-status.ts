import { __ } from '@wordpress/i18n';
import type { Site } from '@automattic/api-core';

export const STATUS_LABELS = {
	public: __( 'Public' ),
	private: __( 'Private' ),
	coming_soon: __( 'Coming soon' ),
	deleted: __( 'Deleted' ),
	difm_lite_in_progress: __( 'Express service' ),
	migration_pending: __( 'Migration pending' ),
	migration_started: __( 'Migration started' ),
};

export function getSiteStatus( item: Site ) {
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

	if ( item.is_coming_soon || ( item.is_private && item.launch_status === 'unlaunched' ) ) {
		return 'coming_soon';
	}

	if ( item.is_private ) {
		return 'private';
	}

	return 'public';
}

export function getSiteMigrationState( item: Site ) {
	const { migration_status } = item.site_migration;
	if ( migration_status === 'migration-in-progress' ) {
		return { status: 'started', type: 'difm' };
	}

	const [ , status, type ] = migration_status?.split( '-' ) ?? [];
	if ( ! [ 'pending', 'started', 'completed' ].includes( status ) ) {
		return null;
	}

	if ( ! [ 'difm', 'diy' ].includes( type ) ) {
		return null;
	}

	if ( ! status || ! type ) {
		return null;
	}

	return { status, type };
}

export function isSiteMigrationInProgress( item: Site ) {
	const { status } = getSiteMigrationState( item ) ?? {};
	if ( ! status ) {
		return false;
	}

	return [ 'pending', 'started' ].includes( status );
}

export function getSiteStatusLabel( item: Site ) {
	return STATUS_LABELS[ getSiteStatus( item ) ];
}
