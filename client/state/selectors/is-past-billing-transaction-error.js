/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if the past billing transaction fetch errored out
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  id      ID of the transaction
 * @return {Boolean}         True if transaction failed to fetch, false otherwise
 */
export default ( state, id ) =>
	get( state, [ 'billingTransactions', 'individualTransactions', id, 'error' ], false );
