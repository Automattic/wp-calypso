import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection } from 'calypso/my-sites/controller';
import { closeLegacyMigration, redirectToMigrationFlow } from './controller';

export default function () {
	// wpcomsh sends wp-admin here while a site's legacy migration status is set.
	page( '/migrate/:site', siteSelection, closeLegacyMigration, makeLayout, clientRender );
	page( '/migrate/choose/:site', redirectToMigrationFlow );
	page( '/migrate/from/:sourceSite/to/:site', redirectToMigrationFlow );
	page( '/migrate/upgrade/from/:sourceSite/to/:site', redirectToMigrationFlow );
	page( '/migrate', redirectToMigrationFlow );
	page( '/migrate/*', redirectToMigrationFlow );
}
