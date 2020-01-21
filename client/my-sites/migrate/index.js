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
	setImportSelector,
	setSiteSelectionHeader,
} from 'my-sites/migrate/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'my-sites/controller';

export default function() {
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
		setImportSelector,
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
