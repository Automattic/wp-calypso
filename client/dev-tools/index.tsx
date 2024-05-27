import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { makeLayout, render as clientRender, redirectIfP2 } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_DEVELOPER_TOOLS } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { devTools } from './controller';

const redirectForNonSimpleSite = ( context: PageJSContext, next: () => void ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	if ( site && site.jetpack && ! site.plan?.expired ) {
		return page.redirect( `/overview/${ context.params.site }` );
	}
	return next();
};

export default function () {
	page( '/dev-tools', siteSelection, sites, makeLayout, clientRender );
	page(
		'/dev-tools/:site',
		siteSelection,
		navigation,
		redirectForNonSimpleSite,
		redirectIfP2,
		devTools,
		siteDashboard( DOTCOM_DEVELOPER_TOOLS ),
		makeLayout,
		clientRender
	);
}
