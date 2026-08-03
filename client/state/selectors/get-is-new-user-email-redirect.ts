import isNewUserEmailRedirect from 'calypso/lib/email-verification/is-new-user-email-redirect';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import type { AppState } from 'calypso/types';

/**
 * Return whether the login page's redirect_to indicates a WordPress core
 * "confirm new admin email address" (`newuseremail`) flow.
 */
export default function getIsNewUserEmailRedirect( state: AppState ): boolean {
	return isNewUserEmailRedirect( getRedirectToOriginal( state ) );
}
