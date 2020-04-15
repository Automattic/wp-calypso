/**
 * External dependencies
 */
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { importSite } from 'my-sites/importer/controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'my-sites/controller';

export default function () {
	page( '/import', siteSelection, navigation, sites, makeLayout, clientRender );

	page(
		'/import/:site_id',
		siteSelection,
		navigation,
		redirectWithoutSite( '/import' ),
		importSite,
		makeLayout,
		clientRender
	);

	// Importing doesn't have any routes for subsections.
	// Redirect to parent `/import`.
	page( '/import/*/:site_id', ( context ) => {
		const site_id = get( context, 'params.site_id' );
		return page.redirect( `/import/${ site_id }` );
	} );
}
