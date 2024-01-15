import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors/get-automated-transfer-status';

import 'calypso/state/automated-transfer/init';

/**
 * Maps automated transfer status value to indication if transfer is active
 * @param {string} status name of current state in automated transfer
 * @returns {?boolean} is transfer currently active? null if unknown
 */
export const isActive = ( status ) =>
	status
		? ! [
				transferStates.NONE,
				transferStates.COMPLETE,
				transferStates.COMPLETED,
				transferStates.FAILURE,
				transferStates.ERROR,
				transferStates.REVERTED,
				transferStates.CONFLICTS,
				transferStates.INQUIRING,
		  ].includes( status )
		: false;
/**
 * Indicates whether or not an automated transfer is active for a given site
 * @param {Object} state app state
 * @param {number} siteId site of interest
 * @returns {?boolean} whether or not transfer is active, or null if not known
 */
export const isAutomatedTransferActive = ( state, siteId ) =>
	isActive( getAutomatedTransferStatus( state, siteId ) );

export default isAutomatedTransferActive;
