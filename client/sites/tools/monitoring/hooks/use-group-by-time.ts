import { useMemo } from 'react';
import { SiteMetricsAPIResponse } from './use-metrics-query';

const STATUS_CODES_TO_GROUP = [ 400, 500 ];

/**
 * It calculates the number of requests per minute for each status code.
 */
export function useGroupByTime(
	data: SiteMetricsAPIResponse[ 'data' ] | undefined,
	statusCodes: number[] = STATUS_CODES_TO_GROUP
) {
	return useMemo( () => {
		const periods = data?.periods || [];
		const groupedData: { [ key: number ]: { [ statusCode: string ]: number } } = {};

		periods.forEach( ( period ) => {
			if ( ! groupedData[ period.timestamp ] ) {
				groupedData[ period.timestamp ] = {};
			}
			// Count status codes
			const statusCodes = Object.keys( period.dimension );
			statusCodes.forEach( ( statusCode ) => {
				groupedData[ period.timestamp ][ statusCode ] = period.dimension[ statusCode ] * 60; // convert it to requests per minute
			} );
		} );

		const dataGroupedByTime = [];
		for ( const statusCode of statusCodes ) {
			dataGroupedByTime.push(
				Object.values( groupedData ).map( ( group ) => group[ statusCode ] || 0 )
			);
		}
		const labels = Object.keys( groupedData ).map( ( key ) => parseInt( key ) );
		return { groupedData, dataGroupedByTime, labels };
	}, [ data, statusCodes ] );
}
