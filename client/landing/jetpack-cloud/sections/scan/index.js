/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { handleHostingPanelRedirect, activationLayout } from 'my-sites/hosting/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/scan', siteSelection, sites, makeLayout, clientRender );

	page(
		'/scan/:site_id',
		siteSelection,
		navigation,
		handleHostingPanelRedirect,
		activationLayout,
		makeLayout,
		clientRender
	);
}
