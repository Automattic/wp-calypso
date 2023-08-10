import { useMemo } from 'react';
import { PeriodData } from '../use-metrics-query';

const STATUS_CODES_TO_GROUP = [ 400, 500 ];

export function useGroupByTime(
	periods: PeriodData[],
	secondsWindow: number,
	statusCodes: number[] = STATUS_CODES_TO_GROUP
) {
	return useMemo( () => {
		const groupedData: { [ key: number ]: { [ statusCode: string ]: number } } = {};

		periods.forEach( ( period ) => {
			const groupTimestamp = period.timestamp - ( period.timestamp % secondsWindow );
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

		const dataForBarChart = [];
		for ( const statusCode of statusCodes ) {
			dataForBarChart.push(
				Object.values( groupedData ).map( ( group ) => group[ statusCode ] || 0 )
			);
		}
		const labels = Object.keys( groupedData ) as unknown as number[];
		return { groupedData, dataGroupedByTime: dataForBarChart, labels };
	}, [ periods, secondsWindow, statusCodes ] );
}
