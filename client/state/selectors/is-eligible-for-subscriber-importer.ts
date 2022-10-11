import { isEnabled } from '@automattic/calypso-config';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import type { AppState } from 'calypso/types';

/**
 * @param state Global state tree
 * @returns Whether or not this user should have the option to Import Subscribers
 */
export default function isEligibleForSubscriberImporter( state: AppState ): boolean {
	return isEnabled( 'subscriber-importer' ) && currentUserHasFlag( state, 'subscriber_import' );
}
