/**
 * External dependencies
 */
import { get, flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import { getAutomatedTransfer } from 'state/automated-transfer/selectors/get-automated-transfer';

import 'state/automated-transfer/init';

/**
 * Helper to get status state from local transfer state sub-tree
 *
 * @param {object} state automated transfer state sub-tree for a site
 * @returns {string} status of transfer
 */
export const getStatusData = ( state ) => get( state, 'status', null );

/**
 * Returns status info for transfer
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} status if available else `null`
 */
export const getAutomatedTransferStatus = compose( getStatusData, getAutomatedTransfer );
