import 'calypso/state/route/init';
import config from '@automattic/calypso-config';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from '../oauth2-clients/ui/selectors';
import getWccomFrom from './get-wccom-from';
import { isWooCommerceCoreProfilerFlow } from './is-woocommerce-core-profiler-flow';
import type { AppState } from 'calypso/types';

/**
 * Return if should enable Woo Passwordless authentication.
 *
 */
export default function getIsWooPasswordless( state: AppState ): boolean {
	if ( ! config.isEnabled( 'woo/passwordless' ) ) {
		return false;
	}

	// Enable Woo Passwordless if user is from WooCommerce Core Profiler.
	if ( isWooCommerceCoreProfilerFlow( state ) ) {
		return true;
	}

	// Enable Woo Passwordless only if user is from WooCommerce.com. Not enable for other flows such as "Core Profiler" for now.
	return isWooOAuth2Client( getCurrentOAuth2Client( state ) ) && getWccomFrom( state ) !== null;
}
