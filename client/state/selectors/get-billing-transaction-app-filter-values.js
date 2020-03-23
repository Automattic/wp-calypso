/**
 * External dependencies
 */
import { groupBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getBillingTransactionsByType from 'state/selectors/get-billing-transactions-by-type';

/**
 * Based on the transactions list, returns metadata for rendering the app filters with counts
 *
 * @param  {object}  state           Global state tree
 * @param  {string}  transactionType Transaction type
 * @returns {Array}                   App filter metadata
 */
export default createSelector(
	( state, transactionType ) => {
		const transactions = getBillingTransactionsByType( state, transactionType );
		if ( ! transactions ) {
			return [];
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
