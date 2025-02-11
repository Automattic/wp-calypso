import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import wpcom from 'calypso/lib/wp';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { parseChartData } from 'calypso/state/stats/lists/utils';
import PageLoading from '../shared/page-loading';

type Unit = 'hour' | 'day' | 'week' | 'month' | 'year';

interface QueryStatsVisitsParams {
	unit: Unit;
	date: string;
	quantity: number;
	stat_fields: string;
}

interface chartMinuteDataTypes {
	[ key: string ]: number;
}

function queryStatsVisits( siteId: number, params: QueryStatsVisitsParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, params );
}
// TODO: Change to 60 for production.
const UPDATE_INTERVAL_IN_SECONDS = 5;
const MINUTE_DATA_LENGTH = 30;

const RealtimeChart = ( { siteId }: { siteId: number } ) => {
	const gmtOffset = useSelector( ( state: object ) =>
		getSiteOption( state, siteId, 'gmt_offset' )
	) as number;
	const [ viewsData, setViewsData ] = useState( {} as chartMinuteDataTypes );

	useEffect( () => {
		const intervalId = setInterval( () => {
			// Index the chart data by YYYY-MM-DD HH:mm:00.
			const adjustedDatetime = moment().utcOffset( gmtOffset ).format( 'YYYY-MM-DD HH:mm:00' );

			queryStatsVisits( siteId, {
				unit: 'hour',
				date: adjustedDatetime,
				quantity: 1,
				stat_fields: 'views',
			} ).then( ( response: any ) => {
				const result = parseChartData( response );
				const views = result[ 0 ].views || 0;

				setViewsData( ( prevViewsData ) => {
					return {
						...prevViewsData,
						[ adjustedDatetime ]: views,
					};
				} );
			} );
		}, UPDATE_INTERVAL_IN_SECONDS * 1000 );

		return () => clearInterval( intervalId );
	}, [ siteId, gmtOffset ] );

	let chartData = useMemo( () => {
		return Object.keys( viewsData ).map( ( eachMinute, idx ) => {
			const lastMinute = moment( eachMinute )
				.subtract( 1, 'minute' )
				.format( 'YYYY-MM-DD HH:mm:00' );

			// Reset the data if the current minute is not continuous with the previous minute,
			// which usually happens when the device is idle for a while.
			if ( viewsData[ lastMinute ] === undefined && idx !== 0 ) {
				setViewsData( {} );
			}

			let diffViews: number = 0;

			// First minute has no previous minute to compare to.
			if ( viewsData[ lastMinute ] === undefined ) {
				diffViews = 0;
			} else if (
				moment( lastMinute ).format( 'YYYY-MM-DD HH' ) !==
				moment( eachMinute ).format( 'YYYY-MM-DD HH' )
			) {
				// If the previous minute is from a different hour, use the current minute's views.
				diffViews = viewsData[ eachMinute ];
			} else {
				// Calculate the difference between the current minute and the previous minute.
				diffViews = viewsData[ eachMinute ] - viewsData[ lastMinute ];
			}

			return {
				// TODO: Support simple string to display time difference rather than forcing a Date object.
				date: new Date( eachMinute ),
				value: diffViews,
			};
		} );
	}, [ JSON.stringify( viewsData ) ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Handle array length with padding or truncating for display.
	if ( chartData.length > 0 && chartData.length < MINUTE_DATA_LENGTH ) {
		const paddingItemsCount = MINUTE_DATA_LENGTH - chartData.length;
		for ( let i = 0; i < paddingItemsCount; i++ ) {
			chartData.unshift( chartData[ 0 ] );
		}
	} else {
		chartData = chartData.slice( -MINUTE_DATA_LENGTH );
	}

	return (
		<div>
			<AsyncLoad
				require="calypso/my-sites/stats/components/line-chart"
				className="stats-realtime-chart"
				height={ 425 }
				placeholder={ PageLoading }
				chartData={ [
					{
						label: 'Views',
						data: chartData,
					},
				] }
			/>
		</div>
	);
};

export default RealtimeChart;
