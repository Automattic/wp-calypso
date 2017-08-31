/**
 * External dependencies
 */
import { createSelector } from 'reselect';
import _ from 'lodash';

export const getRatesTotal = createSelector(
	( rates ) => rates.values,
	( rates ) => rates.available,
	( selectedRates, availableRates ) => {
		const ratesCost = _.map( selectedRates, ( rateId, boxId ) => {
			const packageRates = _.get( availableRates, [ boxId, 'rates' ], false );

			if ( packageRates ) {
				const foundRate = _.find( packageRates, [ 'service_id', rateId ] );

				return foundRate ? foundRate.rate : 0;
			}
			return 0;
		} );

		return Number( _.sum( ratesCost ) ).toFixed( 2 );
	}
);
