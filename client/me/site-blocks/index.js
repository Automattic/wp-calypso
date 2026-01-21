import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfMultiSiteDashboardForcedOptIn,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { siteBlockList } from './controller';

export default function () {
	page(
		'/me/site-blocks',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/blocked-sites' ),
		sidebar,
		siteBlockList,
		makeLayout,
		clientRender
	);
}
