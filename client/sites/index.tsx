import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, setSelectedSiteIdByOrigin } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites/controller';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { SETTINGS_SITE } from './components/site-preview-pane/constants';
import {
	maybeRemoveCheckoutSuccessNotice,
	sanitizeQueryParameters,
	sitesDashboard,
} from './controller';
import { dashboardBackportSiteSettings } from './settings/controller';

export default function () {
	// Maintain old `/sites/:id` URLs by redirecting them to My Home
	page( '/sites/:site', ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = site?.ID;
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );

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
