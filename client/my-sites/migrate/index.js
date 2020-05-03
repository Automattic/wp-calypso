/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	ensureFeatureFlag,
	migrateSite,
	setSiteSelectionHeader,
	setStep,
} from 'my-sites/migrate/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'my-sites/controller';

export default function () {
	page(
		'/migrate',
		ensureFeatureFlag,
		setSiteSelectionHeader,
		siteSelection,
		navigation,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/:site_id',
		ensureFeatureFlag,
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
		ensureFeatureFlag,
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
		ensureFeatureFlag,
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
		ensureFeatureFlag,
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
