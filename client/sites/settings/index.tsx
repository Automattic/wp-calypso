import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import {
	SITE_SETTINGS_AGENCY,
	SITE_SETTINGS_ADMINISTRATION,
	SITE_SETTINGS_SITE,
	SITE_SETTINGS_WEB_SERVER,
	SITE_SETTINGS_CACHES,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { agency, administration, site, webServer, caches } from './controller';

export default function () {
	page( '/sites/settings/site', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/site/:site',
		siteSelection,
		navigation,
		site,
		siteDashboard( SITE_SETTINGS_SITE ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/administration', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/administration/:site',
		siteSelection,
		navigation,
		administration,
		siteDashboard( SITE_SETTINGS_ADMINISTRATION ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/agency', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/agency/:site',
		siteSelection,
		navigation,
		agency,
		siteDashboard( SITE_SETTINGS_AGENCY ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/web-server', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/web-server/:site',
		siteSelection,
		navigation,
		webServer,
		siteDashboard( SITE_SETTINGS_WEB_SERVER ),
		makeLayout,
		clientRender
	);

	page( '/sites/settings/caches', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/settings/caches/:site',
		siteSelection,
		navigation,
		caches,
		siteDashboard( SITE_SETTINGS_CACHES ),
		makeLayout,
		clientRender
	);
}
