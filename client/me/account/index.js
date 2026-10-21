import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { maybeRedirectToDashboard } from '../controller';
import { account } from './controller';

export default function () {
	page(
		'/me/account',
		maybeRedirectToDashboard,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/preferences' ),
		sidebar,
		account,
		makeLayout,
		clientRender
	);
}
