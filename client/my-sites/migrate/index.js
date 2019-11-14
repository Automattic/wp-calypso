/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { migrateSite } from 'my-sites/migrate/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'my-sites/controller';

export default function() {
	page( '/migrate', siteSelection, navigation, sites, makeLayout, clientRender );

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
		'/migrate/:sourceSiteId/:site_id',
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);
}
