/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import earnController from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/earn', siteSelection, sites, makeLayout, clientRender );
	page( '/earn/:site_id', earnController.redirect, makeLayout, clientRender );
	// These 2 are legacy URLs to redirect if they are present anywhere on the web.
	page( '/ads/earnings/:site_id', earnController.redirect, makeLayout, clientRender );
	page( '/ads/settings/:site_id', earnController.redirectToAdsSettings, makeLayout, clientRender );

	page(
		'/earn/:section/:site_id',
		siteSelection,
		navigation,
		earnController.layout,
		makeLayout,
		clientRender
	);
}
