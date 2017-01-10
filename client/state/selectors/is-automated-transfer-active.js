/**
 * External dependencies
 */
import {
	flowRight as compose,
} from 'lodash';

/**
 * Internal Dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';

/**
 * Maps automated transfer status value to indication if transfer is active
 *
 * @param {String} status name of current state in automated transfer
 * @returns {?boolean} is transfer currently active? null if unknown
 */
export const isActive = status =>
	status
		? status === transferStates.START
		: null;

/**
 * Indicates whether or not an automated transfer is active for a given site
 *
 * @param {Object} state app state
 * @param {Number} siteId site of interest
 * @returns {?boolean} whether or not transfer is active, or null if not known
 */
export const isAutomatedTransferActive = compose(
	isActive,
	getAutomatedTransferStatus,
);

export default isAutomatedTransferActive;
