import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { privacy } from './controller';

export default function () {
	page(
		'/me/privacy',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/privacy' ),
		sidebar,
		privacy,
		makeLayout,
		clientRender
	);
}
