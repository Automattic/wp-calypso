import isPassportRedirect from 'calypso/lib/passport/is-passport-redirect';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import type { AppState } from 'calypso/types';

/**
 * Return if it's Passport (either via Passport OAuth client or Passport redirect)
 */
export default function getIsPassport( state: AppState ): boolean {
	return isPassportRedirect( getRedirectToOriginal( state ) );
}
