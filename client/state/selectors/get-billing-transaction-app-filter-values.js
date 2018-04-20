/** @format */
/**
 * External dependencies
 */
import { groupBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getPastBillingTransactions from './get-past-billing-transactions';
import getUpcomingBillingTransactions from './get-upcoming-billing-transactions';

/**
 * Based on the transactions list, returns metadata for rendering the app filters with counts
 *
 * @param  {Object}  state           Global state tree
 * @param  {String}  transactionType Transaction type
 * @return {Array}                   App filter metadata
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

		const appGroups = groupBy( transactions, 'service' );
		return map( appGroups, ( appGroup, app ) => ( {
			title: app,
			value: app,
			count: appGroup.length,
		} ) );
	},
	( state, transactionType ) => [
		'upcoming' === transactionType
			? getUpcomingBillingTransactions( state )
			: getPastBillingTransactions( state ),
	]
);
