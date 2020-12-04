/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, redirectWithoutSite, siteSelection, sites } from 'calypso/my-sites/controller';
import { exportSite, guidedTransfer } from 'calypso/my-sites/exporter/controller';

export default function () {
	page( '/export', siteSelection, navigation, sites, makeLayout, clientRender );

	page(
		'/export/:site_id',
		siteSelection,
		navigation,
		redirectWithoutSite( '/export' ),
		exportSite,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/export/guided/:host_slug?/:site_id',
			siteSelection,
			navigation,
			redirectWithoutSite( '/export' ),
			guidedTransfer,
			makeLayout,
			clientRender
		);
	}

	// Redirect any other child routes to parent `/export`.
	page( '/export/*/:site_id', ( context ) => {
		const site_id = get( context, 'params.site_id' );
		return page.redirect( `/export/${ site_id }` );
	} );
}
