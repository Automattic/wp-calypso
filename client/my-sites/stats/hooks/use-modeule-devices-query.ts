import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

export interface QueryStatsDevicesParams {
	date?: string;
	days?: number;
	max?: number;
}

export interface StatsDevicesData {
	key: string;
	label: string;
	value: number;
}

function queryStatsDevices( siteId: number, deviceParam: string, query: QueryStatsDevicesParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/devices/${ deviceParam }`, query );
}

function capitalizeFirstLetter( string: string ) {
	// Special cases for Apple devices.
	if ( [ 'iphone', 'ios' ].includes( string ) ) {
		return string.charAt( 0 ) + string.charAt( 1 ).toUpperCase() + string.slice( 2 );
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
		queryFn: () => queryStatsDevices( siteId, deviceParam, query ),
		select: ( data ) => parseDevicesData( data as { top_values: { [ key: string ]: number } } ),
		staleTime: 1000 * 60 * 5,
	} );
};

export default useModuleDevicesQuery;
