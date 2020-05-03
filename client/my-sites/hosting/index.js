/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { handleHostingPanelRedirect, layout, activationLayout } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		handleHostingPanelRedirect,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		handleHostingPanelRedirect,
		activationLayout,
		makeLayout,
		clientRender
	);
}
