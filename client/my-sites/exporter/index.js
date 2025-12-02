import page from '@automattic/calypso-router';
import { makeLayout, redirectIfDuplicatedView, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';

export default function () {
	page( '/export', siteSelection, navigation, sites, makeLayout, clientRender );

	page( '/export/:site_id', siteSelection, redirectIfDuplicatedView( 'export.php' ) );

	// Redirect any other child routes to parent `/export`.
	page( '/export/*/:site_id', siteSelection, redirectIfDuplicatedView( 'export.php' ) );
}
