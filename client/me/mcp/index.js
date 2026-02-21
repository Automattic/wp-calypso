import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
// EXPLORE: temporarily using mcpExplore (original: mcp)
import { sidebar, mcpExplore } from 'calypso/me/controller';

export default function () {
	// EXPLORE: temporarily pointing to mcpExplore (original: mcp)
	page(
		'/me/mcp',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		sidebar,
		mcpExplore,
		makeLayout,
		clientRender
	);
}
