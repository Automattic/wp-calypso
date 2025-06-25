import { __ } from '@wordpress/i18n';
import type { Site } from '../data/types';

export const STATUS_LABELS = {
	public: __( 'Public' ),
	private: __( 'Private' ),
	coming_soon: __( 'Coming soon' ),
	deleted: __( 'Deleted' ),
	migration_pending: __( 'Migration pending' ),
	migration_started: __( 'Migration started' ),
};

export function getSiteStatus( item: Site ) {
	if ( item.site_migration.migration_status?.startsWith( 'migration-pending' ) ) {
		return 'migration_pending';
	}

	if ( item.site_migration.migration_status?.startsWith( 'migration-started' ) ) {
		return 'migration_started';
	}

	if ( item.is_deleted ) {
		return 'deleted';
	}

	if ( item.is_coming_soon || ( item.is_private && item.launch_status === 'unlaunched' ) ) {
		return 'coming_soon';
	}

	if ( item.is_private ) {
		return 'private';
	}

	return 'public';
}

export function getSiteStatusLabel( item: Site ) {
	return STATUS_LABELS[ getSiteStatus( item ) ];
}
