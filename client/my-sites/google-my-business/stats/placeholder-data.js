/** @format */

/**
 * External dependencies
 */
import { random } from 'lodash';

const DATA_MIN = 1;
const DATA_MAX = 99;

const statTypeToMetrics = statType => {
	switch ( statType ) {
		case 'ACTIONS':
			return [ 'ACTIONS_WEBSITE', 'ACTIONS_PHONE', 'ACTIONS_DRIVING_DIRECTIONS' ];
		case 'VIEWS':
			return [ 'VIEWS_MAPS', 'VIEWS_SEARCH' ];
		default:
		case 'QUERIES':
			return [ 'QUERIES_DIRECT', 'QUERIES_INDIRECT' ];
	}
};

const getStartDateFromPeriod = period => {
	switch ( period ) {
		case 'quarter':
			const oneQuarterAgo = new Date();
			oneQuarterAgo.setMonth( oneQuarterAgo.getMonth() - 3 );
			return oneQuarterAgo;
		case 'month':
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth( oneMonthAgo.getMonth() - 1 );
			return oneMonthAgo;
		default:
		case 'week':
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate( oneWeekAgo.getDate() - 7 );
			return oneWeekAgo;
	}
};

const generatePlaceHolderDataForMetric = ( metric, period ) => {
	const dimensionalValues = [];
	const startDate = getStartDateFromPeriod( period );
	const endDate = new Date();
	for ( const iter = startDate; iter <= endDate; iter.setDate( iter.getDate() + 1 ) ) {
		dimensionalValues.push( {
			time: iter.toDateString(),
			value: random( DATA_MIN, DATA_MAX ),
		} );
	}

	return {
		metric,
		metricOption: 'AGGREGATED_TOTAL',
		dimensionalValues: {
			startTime: startDate.toDateString(),
			endTime: endDate.toDateString(),
			value: dimensionalValues.reduce( ( result, value ) => result + value.value, 0 ),
		},
	};
};

const placeHolderDataFunction = ( statType, period ) => {
	const metrics = statTypeToMetrics( statType );

	return metrics.map( metric => generatePlaceHolderDataForMetric( metric, period ) );
};

export default placeHolderDataFunction;
