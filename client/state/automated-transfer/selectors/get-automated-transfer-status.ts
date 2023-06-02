import { get, flowRight as compose } from 'lodash';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors/get-automated-transfer';
import type { AppState } from 'calypso/types';

import 'calypso/state/automated-transfer/init';

/**
 * Helper to get status state from local transfer state sub-tree
 *
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {string} status of transfer
 */
export const getStatusData = ( state: AppState ): string | null => get( state, 'status', null );

/**
 * Returns status info for transfer
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} status if available else `null`
 */
export const getAutomatedTransferStatus = compose( getStatusData, getAutomatedTransfer );
