/**
 * External dependencies
 */
import { last, times } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import getBillingTransactionsByType from 'calypso/state/selectors/get-billing-transactions-by-type';

import 'calypso/state/billing-transactions/init';

/**
 * Based on the transactions list, returns metadata for rendering the date filters with counts
 *
 * @param   {object}  state           Global state tree
 * @param   {string}  transactionType Transaction type
 * @param   {string}  [siteId]        Optional site id
 * @returns {Array}                   Date filter metadata
 */
export default createSelector(
	( state, transactionType, siteId = null ) => {
		let transactions = getBillingTransactionsByType( state, transactionType );

		if ( ! transactions ) {
			return [];
		}

		const result = times( 6, ( n ) => {
			const month = moment().subtract( n, 'months' );
			return {
				dateString: moment( month ).startOf( 'month' ).format( 'YYYY-MM-DD' ),
				value: { month: month.format( 'YYYY-MM' ), operator: 'equal' },
				count: 0,
			};
		} );
		const lastMonth = last( result ).value.month;
		result.push( {
			older: true,
			value: { month: lastMonth, operator: 'before' },
			count: 0,
		} );

		if ( siteId ) {
			transactions = transactions.filter( ( transaction ) => {
				return transaction.items.some( ( receiptItem ) => {
					return String( receiptItem.site_id ) === String( siteId );
				} );
			} );
		}

		transactions.forEach( ( transaction ) => {
			const transactionDateString = moment( transaction.date )
				.startOf( 'month' )
				.format( 'YYYY-MM-DD' );
			const found =
				result &&
				result.find( ( item ) => item.dateString && item.dateString === transactionDateString );
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
