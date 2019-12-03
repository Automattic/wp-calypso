/**
 * External dependencies
 */
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { migrateSite } from 'my-sites/migrate/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'my-sites/controller';

export default function() {
	page(
		'/migrate',
		( context, next ) => {
			context.getSiteSelectionHeaderText = () => i18n.translate( 'Select a site to migrate to' );
			next();
		},
		siteSelection,
		navigation,
		sites,
		makeLayout,
		clientRender
	);

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

	// Fallback to handle /migrate/* routes that aren't previously matched
	page( '/migrate/*', () => page.redirect( '/migrate' ) );
}
