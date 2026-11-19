import page from '@automattic/calypso-router';
import { redirectToMigrationFlow, redirectToMigrationOverview } from './controller';

export default function () {
	// wpcomsh sends wp-admin here while a migration runs.
	page( '/migrate/:site_id', redirectToMigrationOverview );

	page( '/migrate/from/:sourceSiteId/to/:site_id', redirectToMigrationFlow );
	page( '/migrate/choose/:site_id', redirectToMigrationFlow );
	page( '/migrate/upgrade/from/:sourceSiteId/to/:site_id', redirectToMigrationFlow );
	page( '/migrate', redirectToMigrationFlow );
	page( '/migrate/*', redirectToMigrationFlow );
}
