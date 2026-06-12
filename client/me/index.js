import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	setSelectedSiteIdByOrigin,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { TELEGRAM_CONNECT_PATH, telegramConnect } from 'calypso/telegram-connect/controller';
import * as controller from './controller';

import './style.scss';

export default function () {
	page(
		'/me',
		controller.maybeRedirectToDashboard,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/profile' ),
		controller.sidebar,
		setSelectedSiteIdByOrigin,
		controller.profile,
		makeLayout,
		clientRender
	);

	// Redirect previous URLs
	page( '/me/profile', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/public-profile', controller.profileRedirect, makeLayout, clientRender );

	// Redirect legacy URLs
	page( '/me/trophies', controller.profileRedirect, makeLayout, clientRender );
	page( '/me/find-friends', controller.profileRedirect, makeLayout, clientRender );

	page( TELEGRAM_CONNECT_PATH, setupPreferences, telegramConnect, makeLayout, clientRender );

	page(
		'/me/get-apps',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/apps' ),
		controller.sidebar,
		controller.apps,
		makeLayout,
		clientRender
	);

	page(
		'/me/mcp/setup',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp/setup' ),
		controller.sidebar,
		controller.mcpSetup,
		makeLayout,
		clientRender
	);
	page(
		'/me/mcp/read',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		controller.sidebar,
		controller.mcpRead,
		makeLayout,
		clientRender
	);
	page(
		'/me/mcp/write',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		controller.sidebar,
		controller.mcpWrite,
		makeLayout,
		clientRender
	);
	page(
		'/me/mcp/mcp-sites',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		controller.sidebar,
		controller.mcpMcpSites,
		makeLayout,
		clientRender
	);
	page(
		'/me/mcp/add-site',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		controller.sidebar,
		controller.mcpAddSite,
		makeLayout,
		clientRender
	);
	page(
		'/me/mcp',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		controller.sidebar,
		controller.mcp,
		makeLayout,
		clientRender
	);
	page( '/me/mcp-setup', controller.mcpSetupLegacyRedirect, makeLayout, clientRender );
}
