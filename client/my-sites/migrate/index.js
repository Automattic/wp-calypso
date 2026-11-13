import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, redirectWithoutSite, siteSelection } from 'calypso/my-sites/controller';
import { migrateSite, redirectToMigrationFlow } from 'calypso/my-sites/migrate/controller';

export default function () {
	// The status page of a site's migration. wpcomsh also sends wp-admin here while one runs.
	page(
		'/migrate/:site_id',
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/from/:sourceSiteId/to/:site_id',
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page( '/migrate/choose/:site_id', redirectToMigrationFlow );
	page( '/migrate/upgrade/from/:sourceSiteId/to/:site_id', redirectToMigrationFlow );
	page( '/migrate', redirectToMigrationFlow );
	page( '/migrate/*', redirectToMigrationFlow );
}
