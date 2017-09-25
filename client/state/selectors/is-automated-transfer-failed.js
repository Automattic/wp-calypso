/**
 * External dependencies
 */
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';

/**
 * Maps automated transfer status value to indication if transfer is failed
 *
 * @param {String} status name of current state in automated transfer
 * @returns {?boolean} is transfer currently failed? null if unknown
 */
export const isFailed = status =>
	status
		? status === transferStates.CONFLICTS || status === transferStates.FAILURE
		: null;

/**
 * Indicates whether or not an automated transfer is failed for a given site
 *
 * @param {Object} state app state
 * @param {Number} siteId site of interest
 * @returns {?boolean} whether or not transfer is failed, or null if not known
 */
export const isAutomatedTransferFailed = compose(
	isFailed,
	getAutomatedTransferStatus,
);

export default isAutomatedTransferFailed;
