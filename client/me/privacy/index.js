import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfMultiSiteDashboardForcedOptIn,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { privacy } from './controller';

export default function () {
	page(
		'/me/privacy',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/privacy' ),
		sidebar,
		privacy,
		makeLayout,
		clientRender
	);
}
