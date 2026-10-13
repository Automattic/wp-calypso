import { isSiteMigrationInProgress } from '../site-status';
import type { Site } from '@automattic/api-core';

const siteWith = ( site_migration: Partial< Site[ 'site_migration' ] > ) =>
	( { site_migration } ) as Site;

describe( 'isSiteMigrationInProgress', () => {
	it( 'locks a WordPress migration by its own state, and the others by their flow sticker', () => {
		expect(
			isSiteMigrationInProgress( siteWith( { type: 'wordpress', status_v2: 'started' } ) )
		).toBe( true );
		expect(
			isSiteMigrationInProgress( siteWith( { type: 'wordpress', status_v2: 'pending' } ) )
		).toBe( true );
		// The legacy sticker can lag behind or disagree: the site's own state decides.
		expect(
			isSiteMigrationInProgress(
				siteWith( {
					type: 'wordpress',
					status_v2: 'completed',
					migration_status: 'migration-started-diy',
				} )
			)
		).toBe( false );

		expect(
			isSiteMigrationInProgress( siteWith( { migration_status: 'migration-started-difm' } ) )
		).toBe( true );
		expect(
			isSiteMigrationInProgress( siteWith( { migration_status: 'migration-completed-diy' } ) )
		).toBe( false );
		expect( isSiteMigrationInProgress( siteWith( {} ) ) ).toBe( false );
	} );
} );
