import { useMemo } from 'react';
import { PeriodData } from '../use-metrics-query';

const STATUS_CODES_TO_GROUP = [ 400, 500 ];

/**
 * It gruops the data by time windows and counts the repetitions of status code in each window.
 */
export function useGroupByTime(
	periods: PeriodData[],
	secondsWindow: number,
	statusCodes: number[] = STATUS_CODES_TO_GROUP
) {
	return useMemo( () => {
		const groupedData: { [ key: number ]: { [ statusCode: string ]: number } } = {};
		const initialTimestamp = periods[ 0 ]?.timestamp || 0;

		periods.forEach( ( period ) => {
			const groupTimestamp =
				initialTimestamp +
				secondsWindow * Math.floor( ( period.timestamp - initialTimestamp ) / secondsWindow );
			if ( ! groupedData[ groupTimestamp ] ) {
				groupedData[ groupTimestamp ] = {};
			}
			// Count status codes
			const statusCodes = Object.keys( period.dimension );
			statusCodes.forEach( ( statusCode ) => {
				if ( ! groupedData[ groupTimestamp ][ statusCode ] ) {
					groupedData[ groupTimestamp ][ statusCode ] = 0;
				}
				groupedData[ groupTimestamp ][ statusCode ]++;
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
	}, [ periods, secondsWindow, statusCodes ] );
}
