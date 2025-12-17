import { User } from '@automattic/api-core';
import { clearQueryClient, disablePersistQueryClient } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { magnificentNonEnLocales } from '@automattic/i18n-utils';

export async function onLogout( user: User ): Promise< void > {
	let logoutUrl = '';

	// If logout_URL isn't set, then go ahead and return the logout URL
	// without a proper nonce as a fallback.
	// Note: we never want to use logout_URL in the desktop app
	if ( ! user.logout_URL || config.isEnabled( 'always_use_logout_url' ) ) {
		// Use localized version of the homepage in the redirect
		let subdomain = '';
		if ( magnificentNonEnLocales.includes( user.language ) ) {
			subdomain = user.language + '.';
		}

		logoutUrl = ( config( 'logout_url' ) as string ).replace( '|subdomain|', subdomain );
	} else {
		logoutUrl = user.logout_URL;
	}

	disablePersistQueryClient();
	clearQueryClient();

	// Dynamically import Calypso v1 cleanup code because it includes a number
	// of dependencies we don't want included in the Hosting Dashboard bundle.
	const { disablePersistence, clearStore } = await import( 'calypso/lib/user/store' );
	disablePersistence();
	clearStore();

	window.location.href = logoutUrl;
}
