import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sitesContext } from './controller';
import { FeatureContexts as loadFeatureContexts } from './features/contexts';

export default function () {
	// Load specific feature route contexts
	loadFeatureContexts( '/sites/:category/:siteUrl' );

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
