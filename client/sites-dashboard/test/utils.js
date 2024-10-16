import { isMigrationInProgress } from 'calypso/sites-dashboard/utils';

describe( 'isMigrationInProgress', () => {
	it.each( [
		{ site: {} },
		{ site: { site_migration: { migration_status: 'migration-completed-diy' } } },
		{ site: { site_migration: { migration_status: 'migration-completed-difm' } } },
	] )( 'returns false when the migration is not in progress', ( { site } ) => {
		expect( isMigrationInProgress( site ) ).toBe( false );
	} );

	it.each( [
		{ site: { site_migration: { migration_status: 'migration-started-diy' } } },
		{ site: { site_migration: { migration_status: 'migration-pending-diy' } } },
	] )( 'returns true when the migration is in progress', ( { site } ) => {
		expect( isMigrationInProgress( site ) ).toBe( true );
	} );
} );
