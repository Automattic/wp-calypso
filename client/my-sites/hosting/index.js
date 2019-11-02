/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { handleHostingPanelRedirect, layout } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/hosting', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting/:site_id',
		siteSelection,
		navigation,
		handleHostingPanelRedirect,
		layout,
		makeLayout,
		clientRender
	);
}
