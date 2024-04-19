import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

export interface QueryStatsDevicesParams {
	date?: string;
	days?: number;
	max?: number;
	num?: number;
	period?: string;
}

export interface StatsDevicesData {
	key: string;
	label: string;
	value: number;
}

const getDaysOfMonthFromDate = ( date: string ): number => {
	const dateObj = new Date( date );
	const year = dateObj.getFullYear();
	const month = dateObj.getMonth() + 1;

	return new Date( year, month, 0 ).getDate();
};

const daysInYearFromDate = ( date: string ) => {
	const dateObj = new Date( date );
	const year = dateObj.getFullYear();

	return ( year % 4 === 0 && year % 100 > 0 ) || year % 400 === 0 ? 366 : 365;
};

const processQueryParams = ( query: QueryStatsDevicesParams ) => {
	// `num` is only for the period `day`.
	const num = query.num || 1;
	// `max` is probably set to 0 to fetch all results.
	const max = query.max ?? 10;
	const date = query.date || new Date().toISOString().split( 'T' )[ 0 ];

	// Calculate the number of days to query based on the period.
	let days = num;
	switch ( query.period ) {
		case 'week':
			days = 7;
			break;
		case 'month':
			days = getDaysOfMonthFromDate( date );
			break;
		case 'year':
			days = daysInYearFromDate( date );
			break;
	}

	return {
		...query,
		num,
		max,
		date,
		days,
	};
};

function queryStatsDevices( siteId: number, deviceParam: string, query: QueryStatsDevicesParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/devices/${ deviceParam }`, query );
}

// TODO: Create or reuse a function to handle particular string capitalization.
function capitalizeFirstLetter( string: string ) {
	// Special cases for Apple devices.
	if ( [ 'iphone', 'ios', 'ipad' ].includes( string ) ) {
		return string.charAt( 0 ) + string.charAt( 1 ).toUpperCase() + string.slice( 2 );
	}

	// Special cases for all-char capitalized string.
	if ( [ 'ie' ].includes( string ) ) {
		return string.toUpperCase();
	}

	return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
}

const parseDevicesData = ( data: {
	top_values: { [ key: string ]: number };
} ): Array< StatsDevicesData > => {
	const keys = Object.keys( data.top_values );

	return keys.map( ( key: string ) => {
		return {
			key,
			label: capitalizeFirstLetter( key ),
			value: data.top_values[ key ],
		};
	} );
};

const useModuleDevicesQuery = (
	siteId: number,
	deviceParam: string,
	query: QueryStatsDevicesParams
) => {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'devices', siteId, deviceParam, query ],
		queryFn: () => queryStatsDevices( siteId, deviceParam, processQueryParams( query ) ),
		select: ( data ) => parseDevicesData( data as { top_values: { [ key: string ]: number } } ),
		staleTime: 1000 * 60 * 5,
	} );
};

export default useModuleDevicesQuery;
