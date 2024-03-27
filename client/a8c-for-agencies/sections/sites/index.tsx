import page from '@automattic/calypso-router';
import { FeatureContexts as loadFeatureContexts } from 'calypso/a8c-for-agencies/sections/sites/features/feature-contexts';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sitesContext } from './controller';

export default function () {
	// Load specific feature route contexts
	loadFeatureContexts( '/sites/:category/:siteUrl' );

	page( '/sites/:category/:siteUrl/:feature', sitesContext, makeLayout, clientRender );
	page( '/sites/:category/:siteUrl', sitesContext, makeLayout, clientRender );
	page( '/sites/:category', sitesContext, makeLayout, clientRender );
	page( '/sites', sitesContext, makeLayout, clientRender );
}
