import { getMigrationStatus, getMigrationType, isMigrationInProgress } from '../utils'; // Adjust the import path as necessary

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

describe( 'getMigrationStatus', () => {
	it.each( [
		{
			site: { site_migration: { migration_status: 'migration-started-anything' } },
			expected: 'started',
		},
		{
			site: { site_migration: { migration_status: 'migration-pending-anything' } },
			expected: 'pending',
		},
		{
			site: { site_migration: { migration_status: 'migration-completed-anything' } },
			expected: 'completed',
		},
		{
			site: { site_migration: { migration_status: 'migration-unknown-anything' } },
			expected: undefined,
		},
		{
			site: { site_migration: {} },
			expected: undefined,
		},
		{
			site: {},
			expected: undefined,
		},
	] )(
		'returns $expected for migration status $site.site_migration.migration_status',
		( { site, expected } ) => {
			expect( getMigrationStatus( site ) ).toBe( expected );
		}
	);
} );

describe( 'getMigrationType', () => {
	it.each( [
		{ site: { site_migration: { migration_status: 'migration-anything-diy' } }, expected: 'diy' },
		{ site: { site_migration: { migration_status: 'migration-anything-difm' } }, expected: 'difm' },
		{
			site: { site_migration: { migration_status: 'migration-anything-unknown' } },
			expected: undefined,
		},
		{
			site: { site_migration: {} },
			expected: undefined,
		},
		{
			site: {},
			expected: undefined,
		},
	] )(
		'returns $expected for migration status $site.site_migration.migration_status',
		( { site, expected } ) => {
			expect( getMigrationType( site ) ).toBe( expected );
		}
	);
} );
