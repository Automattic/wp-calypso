import { SiteExcerptData } from '@automattic/sites';

type MigrationStatus = 'pending' | 'started' | 'completed';
type MigrationType = 'difm' | 'diy';

export type MigrationStatusInfo = SiteExcerptData[ 'site_migration' ];

export type MigrationState = {
	status: MigrationStatus;
	type: MigrationType;
};

const POSSIBLE_STATUSES = [ 'pending', 'started', 'completed' ] as const;
const POSSIBLE_TYPES = [ 'difm', 'diy' ] as const;

export const getMigrationState = (
	site: MigrationStatusInfo | undefined
): MigrationState | null => {
	const { migration_status } = site ?? {};
	const isDAMSInProgress = migration_status === 'migration-in-progress';

	const [ , status, type ] = migration_status?.split( '-' ) ?? [];

	if ( isDAMSInProgress ) {
		return {
			status: 'started',
			type: 'difm',
		};
	}

	if ( ! POSSIBLE_STATUSES.includes( status as MigrationStatus ) ) {
		return null;
	}

	if ( ! POSSIBLE_TYPES.includes( type as MigrationType ) ) {
		return null;
	}
	if ( ! status || ! type ) {
		return null;
	}

	return {
		status: status as MigrationStatus,
		type: type as MigrationType,
	};
};

export const isMigrationInProgress = ( site: SiteExcerptData ) => {
	const state = getMigrationState( site?.site_migration );
	if ( ! state ) {
		return false;
	}
	return [ 'pending', 'started' ].includes( state.status ?? '' );
};

export const getMigrationStatus = ( site: SiteExcerptData ) => {
	const state = getMigrationState( site?.site_migration );

	if ( ! state ) {
		return null;
	}

	return state.status;
};
