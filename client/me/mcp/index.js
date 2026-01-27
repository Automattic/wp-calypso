import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar, mcp } from 'calypso/me/controller';

export default function () {
	page(
		'/me/mcp',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/mcp' ),
		sidebar,
		mcp,
		makeLayout,
		clientRender
	);
}
