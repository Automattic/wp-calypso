/** @format */

const FAKE_VALUES = [ 123, 45, 82, 99, 20, 5, 52 ];

const getMetricFromStatType = statType => {
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

const generatePlaceHolderDataForMetric = ( metric, period, adjustment ) => {
	const dimensionalValues = [];
	const startDate = getStartDateFromPeriod( period );
	const endDate = new Date();
	let counter = adjustment;
	for ( const iter = startDate; iter <= endDate; iter.setDate( iter.getDate() + 1 ) ) {
		counter = ( counter + 1 ) % FAKE_VALUES.length;
		dimensionalValues.push( {
			time: iter.toDateString(),
			value: FAKE_VALUES[ counter ],
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

const statFunction = ( statType, period ) => {
	const metrics = getMetricFromStatType( statType );

	return metrics.map( ( metric, index ) =>
		generatePlaceHolderDataForMetric( metric, period, index )
	);
};

const locationData = {
	id: 12345,
	address: [
		'Centre Commercial Cap 3000',
		'Avenue Eugene Donadei',
		'06700 Saint-Laurent-du-Var',
		'France',
	],
	name: 'Starbucks',
	photo: 'http://www.shantee.net/wp-content/uploads/2016/02/cookies-internet-1030x684.jpg',
	verified: true,
};

export default {
	statFunction,
	locationData,
};
