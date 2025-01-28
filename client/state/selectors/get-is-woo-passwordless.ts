import 'calypso/state/route/init';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from '../oauth2-clients/ui/selectors';
import getWccomFrom from './get-wccom-from';
import isWooPasswordlessJPCFlow from './is-woo-passwordless-jpc-flow';
import type { AppState } from 'calypso/types';

/**
 * Return if should enable Woo Passwordless authentication.
 *
 */
export default function getIsWooPasswordless( state: AppState ): boolean {
	// Enable Woo Passwordless if user is from WooCommerce Core Profiler.
	if ( isWooPasswordlessJPCFlow( state ) ) {
		return true;
	}

	// Enable Woo Passwordless only if user is from WooCommerce.com. Not enable for other flows such as "Core Profiler" for now.
	return isWooOAuth2Client( getCurrentOAuth2Client( state ) ) && getWccomFrom( state ) !== null;
}
