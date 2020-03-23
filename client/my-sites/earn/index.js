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
	page( '/earn/payments', siteSelection, sites, makeLayout, clientRender );
	// This is legacy, we are leaving it here because it may have been public
	page(
		'/earn/memberships/:site_id',
		( { params } ) => page.redirect( '/earn/payments/' + params.site_id ),
		makeLayout,
		clientRender
	);
	page( '/earn/memberships', () => page.redirect( '/earn/payments' ), makeLayout, clientRender );

	page( '/earn/ads', siteSelection, sites, makeLayout, clientRender );
	// These are legacy URLs to redirect if they are present anywhere on the web.
	page( '/earn/ads-earnings/:site_id', earnController.redirectToAds, makeLayout, clientRender );
	page( '/earn/ads-settings/:site_id', earnController.redirectToAds, makeLayout, clientRender );
	page( '/ads/earnings/:site_id', earnController.redirectToAds, makeLayout, clientRender );
	page( '/ads/settings/:site_id', earnController.redirectToAds, makeLayout, clientRender );
	page( '/earn/ads-earnings', '/earn/ads' );
	page( '/earn/ads-settings', '/earn/ads' );
	page( '/ads', '/earn' );
	page( '/ads/*', '/earn' );

	page(
		'/earn/:site_id',
		siteSelection,
		navigation,
		earnController.layout,
		makeLayout,
		clientRender
	);

	page(
		'/earn/:section/:site_id',
		siteSelection,
		navigation,
		earnController.layout,
		makeLayout,
		clientRender
	);
}
