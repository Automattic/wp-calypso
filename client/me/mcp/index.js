import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfMultiSiteDashboardForcedOptIn,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar, mcp } from 'calypso/me/controller';

export default function () {
	page(
		'/me/mcp',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/mcp' ),
		sidebar,
		mcp,
		makeLayout,
		clientRender
	);
}
