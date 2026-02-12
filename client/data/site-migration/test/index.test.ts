import { SiteExcerptData } from '@automattic/sites';
import { getMigrationState, getMigrationStatus, isMigrationInProgress } from '../index';

describe( 'getMigrationState', () => {
	it( 'returns status pending and type difm for migration-pending-difm', () => {
		const migrationInfo = {
			migration_status: 'migration-pending-difm',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'pending',
			type: 'difm',
		} );
	} );

	it( 'returns status started and type difm for migration-started-difm', () => {
		const migrationInfo = {
			migration_status: 'migration-started-difm',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'started',
			type: 'difm',
		} );
	} );

	it( 'returns status pending and type diy for migration-pending-diy', () => {
		const migrationInfo = {
			migration_status: 'migration-pending-diy',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'pending',
			type: 'diy',
		} );
	} );

	it( 'returns status started and type diy for migration-started-diy', () => {
		const migrationInfo = {
			migration_status: 'migration-started-diy',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'started',
			type: 'diy',
		} );
	} );

	it( 'returns status pending and type ssh for migration-pending-ssh', () => {
		const migrationInfo = {
			migration_status: 'migration-pending-ssh',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'pending',
			type: 'ssh',
		} );
	} );

	it( 'returns status started and type ssh for migration-started-ssh', () => {
		const migrationInfo = {
			migration_status: 'migration-started-ssh',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'started',
			type: 'ssh',
		} );
	} );

	it( 'returns status completed and type ssh for migration-completed-ssh', () => {
		const migrationInfo = {
			migration_status: 'migration-completed-ssh',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'completed',
			type: 'ssh',
		} );
	} );

	it( 'returns type DIFM and status started when the migration was started by DAMS', () => {
		const migrationInfo = {
			migration_status: 'migration-in-progress',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( {
			status: 'started',
			type: 'difm',
		} );
	} );

	it( 'returns null when migration info is not defined', () => {
		expect( getMigrationState( undefined ) ).toEqual( null );
	} );

	it( 'returns null when the migration info > migration_status is not defined', () => {
		const migrationInfo = {
			in_progress: false,
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( null );
	} );

	it( 'returns null when the type is not supported', () => {
		const migrationInfo = {
			migration_status: 'migration-pending-unknown',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( null );
	} );

	it( 'returns null when the status is not supported', () => {
		const migrationInfo = {
			migration_status: 'migration-unknown-difm',
		};
		expect( getMigrationState( migrationInfo ) ).toEqual( null );
	} );
} );

describe( 'isMigrationInProgress', () => {
	it.each( [
		null,
		{ site: {} },
		{ site: { site_migration: { migration_status: 'migration-completed-diy' } } },
		{ site: { site_migration: { migration_status: 'migration-completed-difm' } } },
		{ site: { site_migration: { migration_status: 'migration-completed-ssh' } } },
		{ site: { site_migration: { migration_status: 'migration-cancelled-difm' } } },
	] )( 'returns false when the migration is not in progress', ( scenario ) => {
		return expect( isMigrationInProgress( scenario?.site as SiteExcerptData ) ).toBe( false );
	} );

	it.each( [
		{ site: { site_migration: { migration_status: 'migration-started-diy' } } },
		{ site: { site_migration: { migration_status: 'migration-pending-diy' } } },
		{ site: { site_migration: { migration_status: 'migration-started-ssh' } } },
		{ site: { site_migration: { migration_status: 'migration-pending-ssh' } } },
		{ site: { site_migration: { migration_status: 'migration-in-progress' } } },
	] )( 'returns true when the migration is in progress', ( scenario ) => {
		return expect( isMigrationInProgress( scenario?.site as SiteExcerptData ) ).toBe( true );
	} );
} );

describe( 'getMigrationStatus', () => {
	it.each( [
		{
			site: { site_migration: { migration_status: 'migration-started-difm' } },
			expected: 'started',
		},
		{
			site: { site_migration: { migration_status: 'migration-pending-diy' } },
			expected: 'pending',
		},
		{
			site: { site_migration: { migration_status: 'migration-completed-difm' } },
			expected: 'completed',
		},
		{
			site: { site_migration: { migration_status: 'migration-unknown-anything' } },
			expected: null,
		},
		{
			site: { site_migration: {} },
			expected: null,
		},
		{
			site: {},
			expected: null,
		},
	] )(
		'returns $expected for migration status $site.site_migration.migration_status',
		( scenario ) => {
			expect( getMigrationStatus( scenario?.site as SiteExcerptData ) ).toBe( scenario?.expected );
		}
	);
} );
