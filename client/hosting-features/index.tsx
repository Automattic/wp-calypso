import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { makeLayout, render as clientRender, redirectIfP2 } from 'calypso/controller';
import { DOTCOM_HOSTING_FEATURES } from 'calypso/hosting/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/hosting/sites/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { hostingFeatures } from './controller';

const redirectForNonSimpleSite = ( context: PageJSContext, next: () => void ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	if ( site && site.jetpack && ! site.plan?.expired ) {
		return page.redirect( `/overview/${ context.params.site }` );
	}
	return next();
};

export default function () {
	page( '/hosting-features', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting-features/:site',
		siteSelection,
		navigation,
		redirectForNonSimpleSite,
		redirectIfP2,
		hostingFeatures,
		siteDashboard( DOTCOM_HOSTING_FEATURES ),
		makeLayout,
		clientRender
	);
}
