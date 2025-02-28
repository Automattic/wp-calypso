import 'calypso/state/route/init';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from '../oauth2-clients/ui/selectors';
import type { AppState } from 'calypso/types';

/**
 * Return if it's WooCommerce.com.
 *
 */
export default function getIsWCCOM( state: AppState ): boolean {
	return isWooOAuth2Client( getCurrentOAuth2Client( state ) );
}
