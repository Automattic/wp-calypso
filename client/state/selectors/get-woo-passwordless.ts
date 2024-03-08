import 'calypso/state/route/init';
import { getParamFromUrlOrOauth2Redirect } from './get-param-from-url-or-oauth2-redirect';
import type { AppState } from 'calypso/types';

/**
 * Return the value of the `woo-passwordless` query argument.
 *
 */
export default function getWooPasswordless( state: AppState ): string | null {
	return getParamFromUrlOrOauth2Redirect( state, 'woo-passwordless' );
}
