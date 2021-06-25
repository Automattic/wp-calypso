/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/billing-transactions/init';

/**
 * Returns true if the past billing transaction fetch errored out
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  id      ID of the transaction
 * @returns {boolean}         True if transaction failed to fetch, false otherwise
 */
export default ( state, id ) =>
	get( state, [ 'billingTransactions', 'individualTransactions', id, 'error' ], false );
