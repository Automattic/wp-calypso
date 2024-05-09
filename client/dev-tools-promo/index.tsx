import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_OVERVIEW } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { devToolsPromo } from './controller';

const redirectForNonSimpleSite = ( context: PageJSContext, next: () => void ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	if ( site && site.jetpack ) {
		return page.redirect( `/hosting/${ context.params.site }` );
	}
	return next();
};

export default function () {
	page( '/dev-tools-promo', siteSelection, sites, makeLayout, clientRender );
	page(
		'/dev-tools-promo/:site',
		siteSelection,
		navigation,
		redirectForNonSimpleSite,
		devToolsPromo,
		siteDashboard( DOTCOM_OVERVIEW ),
		makeLayout,
		clientRender
	);
}
