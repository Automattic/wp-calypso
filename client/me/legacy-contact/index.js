import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { legacyContact } from './controller';

export default function () {
	if ( ! config.isEnabled( 'me/legacy-contact' ) ) {
		return;
	}

	page(
		'/me/legacy-contact',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/legacy-contact' ),
		sidebar,
		legacyContact,
		makeLayout,
		clientRender
	);
}
