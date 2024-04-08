import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sitesContext } from './controller';
import { FeatureRoutes as loadFeatureRoutes } from './features/routes';

export default function () {
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
