import colorStudio from '@automattic/color-studio';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import NavigationHeader from 'calypso/components/navigation-header';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	MetricsType,
	DimensionParams,
	PeriodData,
	useSiteMetricsQuery,
} from '../hooks/use-metrics-query';
import { SiteMonitoringLineChart } from './site-monitoring-line-chart';
import {
	FirstChartTooltip,
	HttpChartTooltip,
	withSeries,
} from './site-monitoring-line-chart/line-chart-tooltip';
import { timeHighlightPlugin } from './site-monitoring-line-chart/time-highlight-plugin';
import { tooltipsPlugin } from './site-monitoring-line-chart/uplot-tooltip-plugin';
import { useSiteMetricsStatusCodesData } from './site-monitoring-line-chart/use-site-metrics-status-codes-data';
import { SiteMonitoringPieChart } from './site-monitoring-pie-chart';
import { calculateTimeRange, TimeDateChartControls } from './time-range-picker';

import './style.scss';

export interface TimeRange {
	start: number;
	end: number;
}

function useTimeRange() {
	// State to store the selected time range
	const [ selectedTimeRange, setSelectedTimeRange ] = useState( null as TimeRange | null );

	// Function to handle the time range selection
	const handleTimeRangeChange = ( timeRange: TimeRange ) => {
		setSelectedTimeRange( timeRange );
	};

	// Calculate the startTime and endTime using useMemo to memoize the result
	const { start, end } = useMemo( () => {
		return selectedTimeRange || calculateTimeRange( '24-hours' );
	}, [ selectedTimeRange ] );

	return {
		start,
		end,
		handleTimeRangeChange,
	};
}

export function useSiteMetricsData( timeRange: TimeRange, metric?: MetricsType ) {
	const siteId = useSelector( getSelectedSiteId );

	// Use the custom hook for time range selection
	const { start, end } = timeRange;

	const { data: requestsData, isLoading } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
	} );

	const { data: responseTimeData } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'response_time_average',
	} );

	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: PeriodData ) => {
		if ( typeof period?.dimension === 'object' && Object.keys( period.dimension ).length === 0 ) {
			// If the dimension is an empty object, return 0
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
		requestsData?.data?.periods?.reduce(
			( acc, period, index ) => {
				const timestamp = period.timestamp;

				// Check if the timestamp is already in the arrays, if not, push it
				if ( acc[ 0 ][ acc[ 0 ].length - 1 ] !== timestamp ) {
					acc[ 0 ].push( timestamp );

					const requestsPerSecondValue = getDimensionValue( period );
					if ( requestsPerSecondValue !== null ) {
						const requestsPerMinuteValue = requestsPerSecondValue * 60; // Convert to requests per minute
						acc[ 1 ].push( requestsPerMinuteValue ); // Push RPM value into the array
					}
					// Add response time data as a green line
					if ( responseTimeData?.data?.periods && responseTimeData.data.periods[ index ] ) {
						const responseTimeAverageValue = getDimensionValue(
							responseTimeData.data.periods[ index ]
						);
						if ( responseTimeAverageValue !== null ) {
							acc[ 2 ].push( responseTimeAverageValue * 1000 ); // Convert to response time average in milliseconds
						}
					}
				}

				return acc;
			},
			[ [], [], [] ] as Array< Array< number | null > > // Adjust the initial value with placeholders for both lines
		) || ( [ [], [], [] ] as Array< Array< number | null > > ); // Return default value when data is not available yet

	return {
		formattedData,
		isLoading,
	};
}

function useAggregateSiteMetricsData(
	timeRange: TimeRange,
	metric?: MetricsType,
	dimension?: DimensionParams
) {
	const siteId = useSelector( getSelectedSiteId );

	// Use the custom hook for time range selection
	const { start, end } = timeRange;

	const { data } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
		dimension: dimension || 'http_status',
	} );

	const formattedData: Record< string, number > = {};
	data?.data?.periods?.forEach( ( period ) => {
		if ( Array.isArray( period.dimension ) ) {
			return;
		}
		const dimension = period.dimension;
		Object.keys( period.dimension ).forEach( ( key ) => {
			if ( ! formattedData[ key ] ) {
				formattedData[ key ] = 0;
			}
			formattedData[ key ] += dimension[ key ];
		} );
	} );

	return {
		formattedData,
	};
}

/**
 * Filter the data to only include the listed HTTP verbs
 * @param timeRange
 * @param metric
 * @param dimension
 */
function useAggregateHttpVerbData(
	timeRange: TimeRange,
	metric?: MetricsType,
	dimension?: DimensionParams
): { formattedData: Record< string, number > } {
	const data: { formattedData: Record< string, number > } = useAggregateSiteMetricsData(
		timeRange,
		metric,
		dimension
	);
	const allowedVerbs: string[] = [ 'GET', 'POST', 'HEAD', 'DELETE' ];

	const defaultData: Record< ( typeof allowedVerbs )[ number ], number > = allowedVerbs.reduce(
		( acc, verb ) => {
			acc[ verb ] = 0;
			return acc;
		},
		{} as Record< ( typeof allowedVerbs )[ number ], number >
	);

	data.formattedData = { ...defaultData, ...data.formattedData };

	return {
		formattedData: Object.keys( data.formattedData ).reduce(
			( filtered: Record< string, number >, key: string ) => {
				if ( allowedVerbs.includes( key ) ) {
					filtered[ key ] = data.formattedData[ key ];
				}

				return filtered;
			},
			{} as Record< string, number >
		),
	};
}

function getFormattedDataForPieChart(
	data: Record< string, number >,
	labels: Record<
		string,
		{
			name: string;
			className?: string;
		}
	>
) {
	return Object.keys( data ).map( ( key ) => {
		const name = labels[ key ]?.name || key;
		const className = labels[ key ]?.className || key;
		return {
			name,
			className,
			value: data[ key ],
			description: undefined,
		};
	} );
}
export interface HTTPCodeSerie {
	statusCode: number;
	fill: string;
	label: string;
	stroke: string;
	showInLegend?: boolean;
	showInTooltip?: boolean;
}

function colorToAlpha( color: keyof typeof colorStudio.colors, alpha: number ) {
	if ( alpha < 0 || alpha >= 1 ) {
		return colorStudio.colors[ color ];
	}

	const hex = colorStudio.colors[ color ];

	const bigint = parseInt( hex.slice( 1 ), 16 );
	const r = ( bigint >> 16 ) & 255;
	const g = ( bigint >> 8 ) & 255;
	const b = bigint & 255;

	return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;
}

const seriesDefaultProps = {
	fill: colorToAlpha( 'Gray 10', 0.1 ),
	stroke: colorStudio.colors[ 'Gray 10' ],
};

const useSuccessHttpCodeSeries = () => {
	const { __ } = useI18n();
	const series: HTTPCodeSerie[] = [
		{
			statusCode: 200,
			fill: colorToAlpha( 'WordPress Blue 30', 0.1 ),
			label: __( '200: OK Response' ),
			stroke: colorStudio.colors[ 'WordPress Blue 30' ],
			showInLegend: true,
			showInTooltip: true,
		},
		{
			statusCode: 301,
			fill: colorToAlpha( 'Pink 30', 0.2 ),
			label: __( '301: Moved Permanently' ),
			stroke: colorStudio.colors[ 'Pink 30' ],
			showInLegend: true,
			showInTooltip: true,
		},
		{
			statusCode: 302,
			fill: colorToAlpha( 'Celadon 30', 0.1 ),
			label: __( '302: Moved Temporarily' ),
			stroke: colorStudio.colors[ 'Celadon 30' ],
			showInLegend: true,
			showInTooltip: true,
		},
	];
	const statusCodes = series.map( ( { statusCode } ) => statusCode );
	return { series, statusCodes };
};

const useErrorHttpCodeSeries = () => {
	const { __ } = useI18n();
	const series: HTTPCodeSerie[] = [
		// most common 4xx errors
		{
			statusCode: 400,
			fill: colorToAlpha( 'Yellow 10', 0.1 ),
			label: __( '400: Bad Request' ),
			stroke: colorStudio.colors[ 'Yellow 10' ],
			showInLegend: true,
			showInTooltip: true,
		},
		{
			statusCode: 401,
			fill: colorToAlpha( 'Gray 20', 0.1 ),
			label: __( '401: Unauthorized' ),
			stroke: colorStudio.colors[ 'Gray 20' ],
			showInLegend: true,
			showInTooltip: true,
		},
		{
			statusCode: 403,
			fill: colorToAlpha( 'WordPress Blue 30', 0.1 ),
			label: __( '403: Forbidden' ),
			stroke: colorStudio.colors[ 'WordPress Blue 30' ],
			showInLegend: true,
			showInTooltip: true,
		},
		{
			statusCode: 404,
			fill: colorToAlpha( 'Celadon 30', 0.1 ),
			label: __( '404: Not Found' ),
			stroke: colorStudio.colors[ 'Celadon 30' ],
			showInLegend: true,
			showInTooltip: true,
		},
		// most common 5xx errors
		{
			statusCode: 500,
			fill: colorToAlpha( 'Pink 30', 0.1 ),
			label: __( '500: Internal Server Error' ),
			stroke: colorStudio.colors[ 'Pink 30' ],
			showInLegend: true,
			showInTooltip: true,
		},
		// label for other 4xx and 5xx errors
		{
			...seriesDefaultProps,
			statusCode: 0,
			label: __( 'Other 4xx and 5xx errors' ),
			showInLegend: true,
		},
		// remaining 4xx errors
		{
			...seriesDefaultProps,
			statusCode: 402,
			label: __( '402 Payment Required' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 405,
			label: __( '405: Method Not Allowed' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 406,
			label: __( '406: Not Acceptable' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 407,
			label: __( '407: Proxy Authentication Required' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 408,
			label: __( '408: Request Timeout' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 409,
			label: __( '409: Conflict' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 410,
			label: __( '410: Gone' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 411,
			label: __( '411: Length Required' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 412,
			label: __( '412: Precondition Failed' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 413,
			label: __( '413: Content Too Large' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 414,
			label: __( '414: URI Too Long' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 415,
			label: __( '415: Unsupported Media Type' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 416,
			label: __( '416: Range Not Satisfiable' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 417,
			label: __( '417: Expectation Failed' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 421,
			label: __( '421: Misdirected Request' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 422,
			label: __( '422: Unprocessable Content' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 423,
			label: __( '423: Locked' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 424,
			label: __( '424: Failed Dependency' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 425,
			label: __( '425: Too Early' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 426,
			label: __( '426: Upgrade Required' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 428,
			label: __( '428: Precondition Required' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 429,
			label: __( '429: Too Many Requests' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 431,
			label: __( '431: Request Header Fields Too Large' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 451,
			label: __( '451: Unavailable For Legal Reasons' ),
		},
		// remaining 5xx errors
		{
			...seriesDefaultProps,
			statusCode: 501,
			label: __( '501: Not Implemented' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 502,
			label: __( '502: Bad Gateway' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 503,
			label: __( '503: Service Unavailable' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 504,
			label: __( '504: Gateway Timeout' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 505,
			label: __( '505: HTTP Version Not Supported' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 506,
			label: __( '506: Variant Also Negotiates' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 507,
			label: __( '507: Insufficient Storage' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 508,
			label: __( '508: Loop Detected' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 510,
			label: __( '510: Not Extended' ),
		},
		{
			...seriesDefaultProps,
			statusCode: 511,
			label: __( '511: Network Authentication Required' ),
		},
	];
	const statusCodes = series.map( ( { statusCode } ) => statusCode );
	return { series, statusCodes };
};

export const SiteMonitoring = ( { className }: { className?: string } ) => {
	const { __, _x } = useI18n();
	const moment = useLocalizedMoment();
	const timeRange = useTimeRange();
	const { handleTimeRangeChange } = timeRange;
	const { formattedData, isLoading: isLoadingLineChart } = useSiteMetricsData( timeRange );
	const { formattedData: httpVerbFormattedData } = useAggregateHttpVerbData(
		timeRange,
		'requests_persec',
		'http_verb'
	);
	const { formattedData: phpVsStaticFormattedData } = useAggregateSiteMetricsData(
		timeRange,
		'requests_persec',
		'page_renderer'
	);
	const successHttpCodes = useSuccessHttpCodeSeries();
	const { data: dataForSuccessCodesChart } = useSiteMetricsStatusCodesData(
		timeRange,
		successHttpCodes.statusCodes
	);
	const errorHttpCodes = useErrorHttpCodeSeries();
	const { data: dataForErrorCodesChart } = useSiteMetricsStatusCodesData(
		timeRange,
		errorHttpCodes.statusCodes
	);

	const startDate = moment( timeRange.start * 1000 );
	const endDate = moment( timeRange.end * 1000 );
	let dateRange = null;

	if ( endDate.isSame( startDate, 'day' ) ) {
		dateRange = endDate.format( 'LL' );
		dateRange = (
			<>
				<span>{ endDate.format( 'LL' ) }</span>
			</>
		);
	} else {
		dateRange = (
			<>
				<span>{ startDate.format( 'LL' ) }</span> - <span>{ endDate.format( 'LL' ) }</span>
			</>
		);
	}

	return (
		<div className={ clsx( 'site-monitoring-metrics-tab', className ) }>
			<div className="site-monitoring-time-controls__container">
				<NavigationHeader
					className="site-monitoring__navigation-header"
					title={
						<>
							{ translate( 'Monitoring: ' ) }
							{ dateRange }
						</>
					}
					subtitle={ translate( 'Monitor your site’s performance. {{link}}Learn more.{{/link}}', {
						components: {
							link: <InlineSupportLink supportContext="site-monitoring" showIcon={ false } />,
						},
					} ) }
				/>
				<TimeDateChartControls onTimeRangeChange={ handleTimeRangeChange }></TimeDateChartControls>
			</div>
			<SiteMonitoringLineChart
				timeRange={ timeRange }
				title={ __( 'Server performance' ) }
				subtitle={ __( 'Requests per minute and average server response time' ) }
				data={ formattedData as uPlot.AlignedData }
				series={ [
					{
						fill: colorToAlpha( 'WordPress Blue 50', 0.1 ),
						label: __( 'Requests per minute' ),
						stroke: colorStudio.colors[ 'WordPress Blue 50' ],
					},
					{
						fill: colorToAlpha( 'Yellow 30', 0.2 ),
						label: __( 'Average response time (ms)' ),
						stroke: colorStudio.colors[ 'Yellow 30' ],
						scale: 'average-response-time',
						unit: 'ms',
					},
				] }
				isLoading={ isLoadingLineChart }
				options={ {
					plugins: [
						timeHighlightPlugin( 'auto' ),
						tooltipsPlugin( FirstChartTooltip, {
							position: 'followCursor',
						} ),
					],
				} }
			></SiteMonitoringLineChart>
			<div className="site-monitoring__pie-charts">
				<SiteMonitoringPieChart
					title={ __( 'HTTP request methods' ) }
					subtitle={ __( 'Percentage of traffic per HTTP request method' ) }
					className="site-monitoring-http-verbs-pie-chart"
					data={ getFormattedDataForPieChart( httpVerbFormattedData, {
						GET: {
							name: 'GET',
							className: 'verb-get',
						},
						POST: {
							name: 'POST',
							className: 'verb-post',
						},
						HEAD: {
							name: 'HEAD',
							className: 'verb-head',
						},
						DELETE: {
							name: 'DELETE',
							className: 'verb-delete',
						},
					} ) }
				></SiteMonitoringPieChart>
				<SiteMonitoringPieChart
					title={ __( 'Response types' ) }
					subtitle={ __( 'Percentage of dynamic versus static responses' ) }
					className="site-monitoring-php-static-pie-chart"
					data={ getFormattedDataForPieChart( phpVsStaticFormattedData, {
						php: {
							name:
								/* translators: Page response type */
								_x( 'Dynamic', 'response type' ),
							className: 'dynamic',
						},
						static: {
							name:
								/* translators: Page response type */
								_x( 'Static', 'response type' ),
							className: 'static',
						},
					} ) }
					fixedOrder
				></SiteMonitoringPieChart>
			</div>
			<SiteMonitoringLineChart
				timeRange={ timeRange }
				title={ __( 'Successful HTTP responses' ) }
				subtitle={ __( 'Requests per minute completed without errors by the server' ) }
				data={ dataForSuccessCodesChart as uPlot.AlignedData }
				series={ successHttpCodes.series }
				options={ {
					plugins: [
						timeHighlightPlugin( 'auto' ),
						tooltipsPlugin( withSeries( HttpChartTooltip, successHttpCodes.series ), {
							position: 'followCursor',
						} ),
					],
				} }
			></SiteMonitoringLineChart>
			<SiteMonitoringLineChart
				timeRange={ timeRange }
				title={ __( 'Unsuccessful HTTP responses' ) }
				subtitle={ __( 'Requests per minute that encountered errors or issues during processing' ) }
				data={ dataForErrorCodesChart as uPlot.AlignedData }
				series={ errorHttpCodes.series }
				options={ {
					plugins: [
						timeHighlightPlugin( 'auto' ),
						tooltipsPlugin( withSeries( HttpChartTooltip, errorHttpCodes.series ), {
							position: 'followCursor',
						} ),
					],
				} }
			></SiteMonitoringLineChart>
		</div>
	);
};
