import { isEnabled } from '@automattic/calypso-config';
import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { makeLayout, render as clientRender, redirectIfP2 } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DOTCOM_HOSTING_FEATURES } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { hostingFeatures } from './controller';

const redirectForNonSimpleSite = ( context: PageJSContext, next: () => void ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	if ( site && site.jetpack && ! site.plan?.expired ) {
		return page.redirect( addQueryArgs( `/overview/${ context.params.site }`, context.query ) );
	}
	return next();
};

export default function () {
	page( '/hosting-features', siteSelection, sites, makeLayout, clientRender );

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/hosting-features/:site', ( context: PageJSContext ) => {
			page.redirect( `/sites/tools/${ context.params.site }` );
		} );
	} else {
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
}
