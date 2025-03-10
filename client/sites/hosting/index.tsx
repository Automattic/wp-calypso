import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import {
	makeLayout,
	render as clientRender,
	redirectIfP2,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import {
	hostingConfiguration,
	redirectToServerSettingsIfDuplicatedView,
} from 'calypso/hosting/overview/controller';
import { handleHostingPanelRedirect } from 'calypso/hosting/server-settings/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_HOSTING_FEATURES,
} from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
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
	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectToHostingFeaturesIfNotAtomic,
		redirectToServerSettingsIfDuplicatedView,
		handleHostingPanelRedirect,
		hostingConfiguration,
		siteDashboard( DOTCOM_HOSTING_CONFIG ),
		makeLayout,
		clientRender
	);

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
