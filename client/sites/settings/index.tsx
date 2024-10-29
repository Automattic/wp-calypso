import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	SITE_SETTINGS,
	SITE_ADMINISTRATION,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { siteSettings, administrationSettings } from './controller';

export default function () {
	page( '/sites/settings', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/:site',
		siteSelection,
		navigation,
		siteSettings,
		siteDashboard( SITE_SETTINGS ),
		makeLayout,
		clientRender
	);

	page( '/sites/administration', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/administration/:site',
		siteSelection,
		navigation,
		administrationSettings,
		siteDashboard( SITE_ADMINISTRATION ),
		makeLayout,
		clientRender
	);
}
