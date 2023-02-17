import 'calypso/state/billing-transactions/init';
import type { IAppState } from '../types';

/**
 * Returns true if the past billing transaction fetch errored out
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  id      ID of the transaction
 * @returns {boolean}         True if transaction failed to fetch, false otherwise
 */
export default ( state: IAppState, id: number ): boolean =>
	state.billingTransactions?.individualTransactions?.[ id ]?.error ?? false;
