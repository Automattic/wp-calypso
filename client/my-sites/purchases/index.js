/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { purchases, redirectToPurchases } from './controller';

export default () => {
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
};
