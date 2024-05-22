import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_DEVELOPER_TOOLS_PROMO } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { devToolsPromo } from './controller';

const redirectForNonSimpleSiteOrP2 = ( context: PageJSContext, next: () => void ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const isP2 = site && site.options?.is_wpforteams_site;
	const isNonSimpleSite = site && site.jetpack && ! site.plan?.expired;
	if ( isNonSimpleSite || isP2 ) {
		return page.redirect( `/overview/${ context.params.site }` );
	}

	return next();
};

export default function () {
	page( '/dev-tools-promo', siteSelection, sites, makeLayout, clientRender );
	page(
		'/dev-tools-promo/:site',
		siteSelection,
		navigation,
		redirectForNonSimpleSiteOrP2,
		devToolsPromo,
		siteDashboard( DOTCOM_DEVELOPER_TOOLS_PROMO ),
		makeLayout,
		clientRender
	);
}
