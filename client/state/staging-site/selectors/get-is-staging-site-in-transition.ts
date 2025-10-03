import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteInfo } from 'calypso/state/staging-site/selectors/get-staging-site-info';
import type { AppState } from 'calypso/types';

import 'calypso/state/staging-site/init';

/**
 * Helper to determine if staging site is in a transition state (transferring or reverting)
 * @param {Object} state global app state
 * @returns {boolean} whether staging site is in a transition state
 */
export const getStagingSiteIsInTransition = ( state: AppState ): boolean => {
	const status = state?.status ?? StagingSiteStatus.UNSET;
	return (
		status === StagingSiteStatus.INITIATE_TRANSFERRING ||
		status === StagingSiteStatus.TRANSFERRING ||
		status === StagingSiteStatus.INITIATE_REVERTING ||
		status === StagingSiteStatus.REVERTING
	);
};

/**
 * Returns whether staging site is in a transition state (transferring or reverting)
 * @param {Object} state global app state
 * @param {number} siteId requested site for transition info
 * @returns {boolean} true if staging site is in a transition state
 */
export function getIsStagingSiteInTransition( state: AppState, siteId: number | null ): boolean {
	return getStagingSiteIsInTransition( getStagingSiteInfo( state, siteId ) );
}
