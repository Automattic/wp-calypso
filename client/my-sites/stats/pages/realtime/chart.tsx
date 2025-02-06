import moment from 'moment';
import { useEffect, useState } from 'react';
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

const dataUpdateIntervalInSeconds = 5;

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
		}, dataUpdateIntervalInSeconds * 1000 );

		return () => clearInterval( intervalId );
	}, [ siteId, gmtOffset ] );

	// TODO: Push data and shift the array for the chart display.
	const formatedChartData = Object.keys( viewsData ).map( ( eachMinute ) => {
		const lastMinute = moment( eachMinute ).subtract( 1, 'minute' ).format( 'YYYY-MM-DD HH:mm:00' );
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
			date: new Date( eachMinute ),
			value: diffViews,
		};
	} );

	return (
		<div>
			<AsyncLoad
				require="calypso/my-sites/stats/components/line-chart"
				height={ 425 }
				placeholder={ PageLoading }
				chartData={ [
					{ label: 'Views', options: { stroke: '#069e08' }, data: formatedChartData },
				] }
			/>
		</div>
	);
};

export default RealtimeChart;
