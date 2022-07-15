import { get, flowRight as compose } from 'lodash';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors/get-automated-transfer';
import type { AppState } from 'calypso/types';

import 'calypso/state/automated-transfer/init';

/**
 * Helper to get fetching status state from local transfer state sub-tree
 *
 * @param {object} state automated transfer state sub-tree for a site
 * @returns {string} fetching status of transfer
 */
export const getFetchingStatusData = ( state: AppState ): string | null =>
	get( state, 'fetchingStatus', false );

/**
 * Returns status info for transfer
 *
 * @param {object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} status if available else `null`
 */
export const isFetchingAutomatedTransferStatus = compose(
	getFetchingStatusData,
	getAutomatedTransfer
);
