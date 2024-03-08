import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'calypso/my-sites/controller';
import { migrateSite, setSiteSelectionHeader, setStep } from 'calypso/my-sites/migrate/controller';

export default function () {
	page(
		'/migrate',
		setSiteSelectionHeader,
		siteSelection,
		navigation,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/:site_id',
		setStep( 'input' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/from/:sourceSiteId/to/:site_id',
		setStep( 'confirm' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/choose/:site_id',
		setStep( 'migrateOrImport' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/upgrade/from/:sourceSiteId/to/:site_id',
		setStep( 'upgrade' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	// Fallback to handle /migrate/* routes that aren't previously matched
	page( '/migrate/*', () => page.redirect( '/migrate' ) );
}
