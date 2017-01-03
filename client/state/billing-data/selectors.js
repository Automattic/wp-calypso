/**
 * External dependencies
 */
import { get, find } from 'lodash';

/**
 * Returns true if we are currently making a request to get the billing data.
 * False otherwise.
 *
 * @param  {Object}    state  Global state tree
 * @return {Boolean}          Whether the billing data is being requested
 */
export function isRequestingBillingData( state ) {
	return get( state.billingData, 'requesting', false );
}

/**
 * Returns all billing data.
 * Returns null if the billing data has not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @return {?Object}         Billing data
 */
export function getBillingData( state ) {
	return get( state.billingData, 'items', null );
}

/**
 * Returns a past billing transaction.
 * Returns null if the billing data has not been fetched yet, or there is no transaction with that ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  id      ID of the transaction
 * @return {?Object}         The transaction object
 */
export function getPastBillingTransaction( state, id ) {
	const pastTransactions = get( getBillingData( state ), [ 'past' ], null );
	if ( ! pastTransactions ) {
		return null;
	}

	return find( pastTransactions, { id } ) || null;
}
