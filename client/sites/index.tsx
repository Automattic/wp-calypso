import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, setSelectedSiteIdByOrigin } from 'calypso/controller';
import { siteSelection, navigation } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites/controller';
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
	 * Backport dashboard v2
	 */
	page(
		'/sites/:site/settings/:feature?',
		siteSelection,
		navigation,
		dashboardBackportSiteSettings,
		siteDashboard( SETTINGS_SITE ),
		makeLayout,
		clientRender
	);

	page(
		'/sites/:site',
		siteSelection,
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
		sanitizeQueryParameters,
		navigation,
		setSelectedSiteIdByOrigin,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}
