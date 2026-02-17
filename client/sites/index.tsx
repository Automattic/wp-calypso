import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	setSelectedSiteIdByOrigin,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { siteSelection, navigation } from 'calypso/my-sites/controller';
import { maybeRedirectToDashboard, siteDashboard } from 'calypso/sites/controller';
import { OVERVIEW, SETTINGS_SITE } from './components/site-preview-pane/constants';
import {
	maybeRemoveCheckoutSuccessNotice,
	sanitizeQueryParameters,
	sitesDashboard,
} from './controller';
import { dashboardBackportSiteOverview } from './overview/controller';
import { dashboardBackportSiteSettings } from './settings/controller';

export default function () {
	/**
	 * Backport Multi-site Dashboard
	 */
	page( '/sites/settings/site/:site', ( context ) => {
		return page.redirect( `/sites/${ context.params.site }/settings` );
	} );

	page(
		'/sites/:site/settings/:feature?',
		siteSelection,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(),
		navigation,
		dashboardBackportSiteSettings,
		siteDashboard( SETTINGS_SITE ),
		makeLayout,
		clientRender
	);

	page(
		'/sites/:site',
		siteSelection,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(),
		navigation,
		dashboardBackportSiteOverview,
		siteDashboard( OVERVIEW ),
		makeLayout,
		clientRender
	);

	page(
		'/p2s',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		navigation,
		setSelectedSiteIdByOrigin,
		sitesDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/sites',
		maybeRemoveCheckoutSuccessNotice,
		maybeRedirectToDashboard,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(),
		sanitizeQueryParameters,
		navigation,
		setSelectedSiteIdByOrigin,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}
