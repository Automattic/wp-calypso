import page from '@automattic/calypso-router';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	addSitesContext,
	sitesContext,
	needsSetupContext,
	dashboardSitesContext,
} from './controller';
import { FeatureRoutes as loadFeatureRoutes } from './features/routes';

export default function () {
	// Always keep this route at the top since it's the most specific /sites route
	page(
		A4A_SITES_LINK_NEEDS_SETUP,
		requireAccessContext,
		needsSetupContext,
		makeLayout,
		clientRender
	);

	page(
		'/sites/add/from-wpcom',
		requireAccessContext,
		dashboardSitesContext,
		addSitesContext,
		makeLayout,
		clientRender
	);

	// Load specific feature route contexts
	loadFeatureRoutes( '/sites/:category/:siteUrl' );

	page(
		'/sites/:category/:siteUrl/:feature',
		requireAccessContext,
		sitesContext,
		makeLayout,
		clientRender
	);
	page( '/sites/:category/:siteUrl', requireAccessContext, sitesContext, makeLayout, clientRender );
	page( '/sites/:category', requireAccessContext, sitesContext, makeLayout, clientRender );
	page( '/sites', requireAccessContext, sitesContext, makeLayout, clientRender );
}
