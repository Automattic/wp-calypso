import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import wpcom from 'calypso/lib/wp';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
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
	[ key: string ]: {
		views: number;
	};
}

function queryStatsVisits( siteId: number, params: QueryStatsVisitsParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, params );
}

const dataUpdateIntervalInSeconds = 5;

const RealtimeChart = ( { siteId }: { siteId: number } ) => {
	const momentSiteZone = useSelector( ( state: object ) =>
		getMomentSiteZone( state, siteId, 'YYYY-MM-DD HH' )
	);
	const [ chartData, setChartData ] = useState( {} as chartMinuteDataTypes );

	useEffect( () => {
		const intervalId = setInterval( () => {
			const currentTime = moment().format( 'mm:00' );
			// Index the chart data by YYYY-MM-DD HH:mm:00.
			const adjustedDatetime = `${ momentSiteZone.format( 'YYYY-MM-DD HH' ) }:${ currentTime }`;

			queryStatsVisits( siteId, {
				unit: 'hour',
				date: adjustedDatetime,
				quantity: 1,
				stat_fields: 'views',
			} ).then( ( response: any ) => {
				const result = parseChartData( response );
				// TODO: Handle data across hours because hourly data is not accumulated.
				setChartData( ( prevChartData ) => {
					return {
						...prevChartData,
						[ adjustedDatetime ]: {
							views: result[ 0 ].views,
						},
					};
				} );
			} );
		}, dataUpdateIntervalInSeconds * 1000 );

		return () => clearInterval( intervalId );
	}, [ siteId, momentSiteZone ] );

	// TODO: Push data and shift the array for the chart display.
	const formatedChartData = Object.keys( chartData ).map( ( key ) => {
		return {
			date: new Date( key ),
			value: chartData[ key ].views,
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
