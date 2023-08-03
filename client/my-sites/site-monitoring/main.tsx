import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMonitoringPieChart } from './components/site-monitoring-pie-chart';
import UplotChartMetrics from './metrics-chart';
import { MetricsType, DimensionParams, PeriodData, useSiteMetricsQuery } from './use-metrics-query';

export function useSiteMetricsData( start?: number, end?: number, metric?: MetricsType ) {
	const siteId = useSelector( getSelectedSiteId );

	// Calculate the startTime and endTime using useMemo
	const startTime = useMemo( () => start || moment().subtract( 24, 'hours' ).unix(), [ start ] );
	const endTime = useMemo( () => end || moment().unix(), [ end ] );

	const { data } = useSiteMetricsQuery( siteId, {
		start: startTime,
		end: endTime,
		metric: metric || 'requests_persec',
	} );

	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: PeriodData ) => {
		if ( Array.isArray( period?.dimension ) ) {
			// If the dimension is an array, return 0
			return 0;
		} else if ( typeof period?.dimension === 'object' ) {
			// If the dimension is an object, try to find and return the dimension value
			const firstKey = Object.keys( period.dimension )[ 0 ];
			return firstKey ? period.dimension[ firstKey ] : null;
		}

		return null;
	};

	// Process the data in the format accepted by uPlot
	const formattedData =
		data?.data?.periods?.reduce(
			( acc, period ) => {
				acc[ 0 ].push( period.timestamp );
				acc[ 1 ].push( getDimensionValue( period ) );
				return acc;
			},
			[ [], [] ] as Array< Array< number | null > > // Define the correct initial value type
		) || ( [ [], [] ] as Array< Array< number | null > > ); // Return a default value when data is not available yet

	return {
		formattedData,
	};
}

export function useAggregateSiteMetricsData(
	start?: number,
	end?: number,
	metric?: MetricsType,
	dimension?: DimensionParams
) {
	const siteId = useSelector( getSelectedSiteId );

	// Calculate the startTime and endTime using useMemo
	const startTime = useMemo( () => start || moment().subtract( 24, 'hours' ).unix(), [ start ] );
	const endTime = useMemo( () => end || moment().unix(), [ end ] );

	const { data } = useSiteMetricsQuery( siteId, {
		start: startTime,
		end: endTime,
		metric: metric || 'requests_persec',
		dimension: dimension || 'http_status',
	} );

	const formattedData = {};
	data?.data?.periods?.forEach( ( period ) => {
		Object.keys( period.dimension ).forEach( ( key ) => {
			if ( ! formattedData[ key ] ) {
				formattedData[ key ] = 0;
			}
			formattedData[ key ] += period.dimension[ key ];
		} );
	} );

	return {
		formattedData,
	};
}

function getFormattedDataForPieChart(
	data: Record< string, number >,
	labels: Record< string, string >
) {
	return Object.keys( data ).map( ( key ) => {
		const name = labels[ key ] || key;
		return {
			name,
			value: data[ key ],
			description: undefined,
		};
	} );
}

export function SiteMetrics() {
	const { formattedData } = useSiteMetricsData();
	const { formattedData: cacheHitMissFormattedData } = useAggregateSiteMetricsData(
		undefined,
		undefined,
		'requests_persec',
		'page_is_cached'
	);
	const { formattedData: phpVsStaticFormattedData } = useAggregateSiteMetricsData(
		undefined,
		undefined,
		'requests_persec',
		'page_renderer'
	);

	return (
		<>
			<h2>Atomic site</h2>
			<UplotChartMetrics data={ formattedData as uPlot.AlignedData }></UplotChartMetrics>
			<div class="site-monitoring__pie-charts">
				<SiteMonitoringPieChart
					title="Cache hit/miss"
					className="site-monitoring-cache-pie-chart"
					data={ getFormattedDataForPieChart( cacheHitMissFormattedData, {
						0: 'Cache miss',
						1: 'Cache hit',
					} ) }
				></SiteMonitoringPieChart>
				<SiteMonitoringPieChart
					title="PHP vs. static content served"
					className="site-monitoring-php-static-pie-chart"
					data={ getFormattedDataForPieChart( phpVsStaticFormattedData, {
						php: 'PHP',
						static: 'Static',
					} ) }
				></SiteMonitoringPieChart>
			</div>
		</>
	);
}
