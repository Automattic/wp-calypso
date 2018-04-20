/** @format */
/**
 * External dependencies
 */
import { moment, translate } from 'i18n-calypso';
import { forEach, orderBy, range } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getPastBillingTransactions from './get-past-billing-transactions';
import getUpcomingBillingTransactions from './get-upcoming-billing-transactions';

/**
 * Based on the transactions list, returns metadata for rendering the date filters with counts
 *
 * @param  {Object}  state           Global state tree
 * @param  {String}  transactionType Transaction type
 * @return {Array}                   Date filter metadata
 */
export default createSelector(
	( state, transactionType ) => {
		const transactions =
			'upcoming' === transactionType
				? getUpcomingBillingTransactions( state )
				: getPastBillingTransactions( state );

		if ( ! transactions ) {
			return [];
		}

		const result = range( 6 ).reduce( function( accumulator, n ) {
			const month = moment().subtract( n, 'months' );
			const key = month.format( 'YYYY-MM' );
			accumulator[ key ] = {
				title: month.format( 'MMM YYYY' ),
				value: { month: key, operator: 'equal' },
				count: 0,
				key,
			};
			return accumulator;
		}, {} );
		const olderDate = moment()
			.subtract( 6, 'months' )
			.format( 'YYYY-MM' );
		result.older = {
			title: translate( 'Older' ),
			value: { month: olderDate, operator: 'before' },
			count: 0,
			key: olderDate,
		};

		forEach( transactions, transaction => {
			const transactionDate = moment( transaction.date ).format( 'YYYY-MM' );
			if ( result[ transactionDate ] ) {
				result[ transactionDate ].count++;
			} else {
				result.older.count++;
			}
		} );

		return orderBy( result, 'key', 'desc' );
	},
	( state, transactionType ) => [
		'upcoming' === transactionType
			? getUpcomingBillingTransactions( state )
			: getPastBillingTransactions( state ),
	]
);
