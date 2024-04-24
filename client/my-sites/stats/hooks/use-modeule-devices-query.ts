import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';
import { processQueryParams, QueryStatsParams } from './utils';

export interface StatsDevicesData {
	key: string;
	label: string;
	value: number;
}

function queryStatsDevices( siteId: number, deviceParam: string, query: QueryStatsParams ) {
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

const useModuleDevicesQuery = ( siteId: number, deviceParam: string, query: QueryStatsParams ) => {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'devices', siteId, deviceParam, query ],
		queryFn: () => queryStatsDevices( siteId, deviceParam, processQueryParams( query ) ),
		select: ( data ) => parseDevicesData( data as { top_values: { [ key: string ]: number } } ),
		staleTime: 1000 * 60 * 5,
	} );
};

export default useModuleDevicesQuery;
