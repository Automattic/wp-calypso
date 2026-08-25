import isUserAccountEmailUpdateRedirect from 'calypso/lib/email-verification/is-user-account-email-update-redirect';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import type { AppState } from 'calypso/types';

/**
 * Return whether the login page's redirect_to indicates a WordPress core
 * "confirm new admin email address" (`newuseremail`) flow.
 */
export default function getIsUserAccountEmailUpdateRedirect( state: AppState ): boolean {
	return isUserAccountEmailUpdateRedirect( getRedirectToOriginal( state ) );
}
