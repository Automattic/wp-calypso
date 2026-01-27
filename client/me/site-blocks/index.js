import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { siteBlockList } from './controller';

export default function () {
	page(
		'/me/site-blocks',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/blocked-sites' ),
		sidebar,
		siteBlockList,
		makeLayout,
		clientRender
	);
}
