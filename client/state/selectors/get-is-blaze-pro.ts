import 'calypso/state/route/init';
import { isBlazeProOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from '../oauth2-clients/ui/selectors';
import type { AppState } from 'calypso/types';

/**
 * Return whether it's Blaze Pro authentication flow.
 */
export default function getIsBlazePro( state: AppState ): boolean {
	return isBlazeProOAuth2Client( getCurrentOAuth2Client( state ) );
}
