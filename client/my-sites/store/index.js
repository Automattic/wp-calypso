import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import StatsController from './app/store-stats/controller';
import './style.scss';

function redirectIfWooCommerceNotInstalled( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if (
		site &&
		! isSiteStore( state, site.ID ) &&
		! getSiteOption( state, site.ID, 'is_wpcom_store' )
	) {
		page.redirect( `/woocommerce-installation/${ site.slug }` );
		return;
	}

	next();
}

export default async function () {
	// Add pages that use my-sites navigation instead
	page(
		'/store/stats/:type/:unit',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		sites,
		makeLayout,
		clientRender
	);
	page(
		'/store/stats/:type/:unit/:site',
		siteSelection,
		redirectIfWooCommerceNotInstalled,
		navigation,
		StatsController,
		makeLayout,
		clientRender
	);
}
