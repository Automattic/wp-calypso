/**
 * External dependencies
 */
import { flowRight as compose } from 'lodash';

/**
 * Internal Dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors/get-automated-transfer-status';

import 'state/automated-transfer/init';

/**
 * Maps automated transfer status value to indication if transfer is failed
 *
 * @param {string} status name of current state in automated transfer
 * @returns {?boolean} is transfer currently failed? null if unknown
 */
export const isFailed = ( status ) =>
	status ? status === transferStates.CONFLICTS || status === transferStates.FAILURE : null;

/**
 * Indicates whether or not an automated transfer is failed for a given site
 *
 * @param {object} state app state
 * @param {number} siteId site of interest
 * @returns {?boolean} whether or not transfer is failed, or null if not known
 */
export const isAutomatedTransferFailed = compose( isFailed, getAutomatedTransferStatus );

export default isAutomatedTransferFailed;
