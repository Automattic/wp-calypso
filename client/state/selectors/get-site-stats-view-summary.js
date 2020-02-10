/**
 * External dependencies
 */
import { round } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { getSiteStatsForQuery } from 'state/stats/lists/selectors';

import 'state/stats/init';

/**
 * Returns the date of the last site stats query
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {object}           Stats View Summary
 */
export default function getSiteStatsViewSummary( state, siteId ) {
	const query = {
		stat_fields: 'views',
		quantity: -1,
	};
	const viewData = getSiteStatsForQuery( state, siteId, 'statsVisits', query );

	if ( ! viewData || ! viewData.data ) {
		return null;
	}

	const viewSummary = {};

	viewData.data.forEach( item => {
		const [ date, value ] = item;
		const momentDate = moment( date );
		const { years, months } = momentDate.toObject();

		if ( ! viewSummary[ years ] ) {
			viewSummary[ years ] = {};
		}

		if ( ! viewSummary[ years ][ months ] ) {
			viewSummary[ years ][ months ] = {
				total: 0,
				data: [],
				average: 0,
				daysInMonth: momentDate.daysInMonth(),
			};
		}
		viewSummary[ years ][ months ].total += value;
		viewSummary[ years ][ months ].data.push( item );
		const average =
			viewSummary[ years ][ months ].total / viewSummary[ years ][ months ].daysInMonth;
		viewSummary[ years ][ months ].average = round( average, 0 );
	} );

	return viewSummary;
}
