import config from '@automattic/calypso-config';
import {
	isSupportUserSession,
	isSupportNextSession,
	supportUserBoot,
	supportNextBoot,
} from 'calypso/lib/user/support-user-interop';
import { type UserData } from '../user';
import { filterUserObject } from './filter-user-object';
import { rawCurrentUserFetch } from './raw-current-user-fetch';

export async function initializeCurrentUser(): Promise< UserData | false > {
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
		if ( ( window as any ).currentUser ) {
			return ( window as any ).currentUser;
		}
		return false;
	}

	let userData;
	try {
		userData = await rawCurrentUserFetch();
	} catch ( error: any ) {
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
