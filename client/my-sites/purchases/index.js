/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { purchases, redirectToPurchases, purchaseSettings } from './controller';
import config from 'config';
import legacyRouter from 'me/purchases';

export default ( router ) => {
	if ( ! config.isEnabled( 'site-level-billing' ) ) {
		legacyRouter( router );
		return;
	}

	page( '/purchases', siteSelection, navigation, sites, makeLayout, clientRender );
	page( '/purchases/subscriptions', siteSelection, navigation, sites, makeLayout, clientRender );
	page(
		'/purchases/:site',
		siteSelection,
		navigation,
		redirectToPurchases,
		makeLayout,
		clientRender
	);
	page(
		'/purchases/subscriptions/:site',
		siteSelection,
		navigation,
		purchases,
		makeLayout,
		clientRender
	);
	page(
		'/purchases/subscriptions/:site/:receiptId',
		siteSelection,
		navigation,
		purchaseSettings,
		makeLayout,
		clientRender
	);
};
