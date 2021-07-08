/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import {
	isSupportUserSession,
	isSupportNextSession,
	supportUserBoot,
	supportNextBoot,
} from 'calypso/lib/user/support-user-interop';
import { filterUserObject } from './filter-user-object';
import { rawCurrentUserFetch } from './raw-current-user-fetch';

export async function initializeCurrentUser() {
	let skipBootstrap = false;

	if ( isSupportUserSession() ) {
		// boot the support session and skip the user bootstrap: the server sent the unwanted
		// user info there (me) instead of the target SU user.
		supportUserBoot();
		skipBootstrap = true;
	}

	if ( isSupportNextSession() ) {
		// boot the support session and proceed with user bootstrap (unlike the SupportUserSession,
		// the initial GET request includes the right cookies and header and returns a server-generated
		// page with the right window.currentUser value)
		supportNextBoot();
	}

	if ( ! skipBootstrap && config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		if ( window.currentUser ) {
			return window.currentUser;
		}
		return false;
	}

	let userData;
	try {
		userData = await rawCurrentUserFetch();
	} catch ( error ) {
		if ( error.error !== 'authorization_required' ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to fetch the user from /me endpoint:', error );
		}
	}

	if ( ! userData ) {
		return false;
	}

	return filterUserObject( userData );
}
