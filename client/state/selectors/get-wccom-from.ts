import 'calypso/state/route/init';
import { getParamFromUrlOrOauth2Redirect } from './get-param-from-url-or-oauth2-redirect';
import type { AppState } from 'calypso/types';

/**
 * Return the value of the `wccom-from` query argument.
 *
 * Login flow and signup flow use different query arguments to pass the `wccom-from` value.
 * Login flow uses `wccom-from` directly, while signup flow uses `oauth2_redirect` to pass the `wccom-from` value.
 */
export default function getWccomFrom( state: AppState ): string | null {
	return getParamFromUrlOrOauth2Redirect( state, 'wccom-from' );
}
