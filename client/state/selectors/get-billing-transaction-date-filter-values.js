/** @format */
/**
 * External dependencies
 */
import { moment, translate } from 'i18n-calypso';
import { find, forEach, last, times } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getBillingTransactionsByType from 'state/selectors/get-billing-transactions-by-type';

/**
 * Based on the transactions list, returns metadata for rendering the date filters with counts
 *
 * @param  {Object}  state           Global state tree
 * @param  {String}  transactionType Transaction type
 * @return {Array}                   Date filter metadata
 */
export default createSelector(
	( state, transactionType ) => {
		const transactions = getBillingTransactionsByType( state, transactionType );

		if ( ! transactions ) {
			return [];
		}

		const result = times( 6, n => {
			const month = moment().subtract( n, 'months' );
			return {
				title: month.format( 'MMM YYYY' ),
				value: { month: month.format( 'YYYY-MM' ), operator: 'equal' },
				count: 0,
			};
		} );
		const lastMonth = last( result ).value.month;
		result.push( {
			title: translate( 'Older' ),
			value: { month: lastMonth, operator: 'before' },
			count: 0,
		} );

		forEach( transactions, transaction => {
			const transactionMonth = moment( transaction.date ).format( 'MMM YYYY' );
			const found = find( result, { title: transactionMonth } );
			if ( found ) {
				found.count++;
			} else {
				last( result ).count++;
			}
		} );

		return result;
	},
	( state, transactionType ) => [ getBillingTransactionsByType( state, transactionType ) ]
);
