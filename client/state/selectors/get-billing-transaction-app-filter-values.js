/**
 * External dependencies
 */
import { groupBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import getBillingTransactionsByType from 'calypso/state/selectors/get-billing-transactions-by-type';

import 'calypso/state/billing-transactions/init';

/**
 * Based on the transactions list, returns metadata for rendering the app filters with counts
 *
 * @param  {object}  state           Global state tree
 * @param  {string}  transactionType Transaction type
 * @param   {string}  [siteId]        Optional site id
 * @returns {Array}                   App filter metadata
 */
export default createSelector(
	( state, transactionType, siteId = null ) => {
		let transactions = getBillingTransactionsByType( state, transactionType );
		if ( ! transactions ) {
			return [];
		}

		if ( siteId ) {
			transactions = transactions.filter( ( transaction ) => {
				return transaction.items.some( ( receiptItem ) => {
					return String( receiptItem.site_id ) === String( siteId );
				} );
			} );
		}

		const appGroups = groupBy( transactions, 'service' );
		return map( appGroups, ( appGroup, app ) => ( {
			title: app,
			value: app,
			count: appGroup.length,
		} ) );
	},
	( state, transactionType ) => [ getBillingTransactionsByType( state, transactionType ) ]
);
