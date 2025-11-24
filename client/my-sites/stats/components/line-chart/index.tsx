import {
	LineChart,
	ThemeProvider,
	jetpackTheme,
	type EventHandlerParams,
	type DataPointDate,
} from '@automattic/charts';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import ChartBarTooltip from 'calypso/components/chart/bar-tooltip';
import { DATE_FORMAT } from '../../constants';
import { useMomentInSite } from '../../hooks/use-moment-site-zone';
import StatsEmptyState from '../../stats-empty-state';

import './styles.scss';

function StatsLineChart( {
	chartData = [],
	formatTimeTick,
	className,
	onClick,
	height = 400,
	emptyState = (
		<StatsEmptyState
			headingText={ translate( 'No data available' ) }
			infoText={ translate( 'Try selecting a different time frame.' ) }
		/>
	),
	zeroBaseline = true,
	fixedDomain = false,
	curveType = 'monotone',
}: {
	chartData: Array< {
		label: string;
		icon?: JSX.Element;
		options: object;
		data: Array< DataPointDate >;
	} >;
	formatTimeTick?: ( value: number ) => string;
	className?: string;
	height?: number;
	emptyState: JSX.Element;
	zeroBaseline?: boolean;
	fixedDomain?: boolean;
	curveType?: 'smooth' | 'linear' | 'monotone';
	onClick?: ( item: { data: { period: string } } ) => void;
} ) {
	const moment = useMomentInSite();

	const formatTime = formatTimeTick
		? formatTimeTick
		: ( timestamp: number ) => {
				const date = new Date( timestamp );
				return date.toLocaleDateString( undefined, {
					month: 'short',
					day: 'numeric',
				} );
		  };

	const formatValue = ( value: number ) => {
		return value < 100_000
			? value.toFixed( 0 )
			: formatNumber( value, { numberFormatOptions: { notation: 'compact' }, decimals: 1 } );
	};

	const isEmpty = ( chartData?.[ 0 ]?.data || [] ).length === 0;

	const maxValue = useMemo(
		() =>
			Math.max(
				...chartData.map( ( series ) =>
					Math.max( ...series.data.map( ( d ) => d.value as number ) )
				)
			),
		[ chartData ]
	);

	const yNumTicks = useMemo( () => {
		const uniqueValues = [
			...new Set( chartData.flatMap( ( series ) => series.data.map( ( d ) => d.value ?? 0 ) ) ),
		];

		const maxTicks = uniqueValues.length > 5 ? 5 : uniqueValues.length;

		if ( fixedDomain ) {
			return maxTicks;
		}

		// The only one tick, e.g. [ 2 ] or two ticks not [ 1, 2 ], e.g. [ 1, 3 ].
		if ( maxTicks === 1 || ( maxTicks === 2 && Math.max( ...uniqueValues ) > 2 ) ) {
			return maxTicks;
		}

		return maxTicks - 1;
	}, [ chartData, fixedDomain ] );

	const yScaleType = useMemo( () => {
		if ( chartData.length <= 1 ) {
			return 'linear';
		}

		const maxValues = chartData.map( ( series ) =>
			Math.max( ...series.data.map( ( d ) => d.value as number ) )
		);
		const [ minMax, maxMax ] = [ Math.min( ...maxValues ), Math.max( ...maxValues ) ];

		// Avoid division by zero
		if ( minMax === 0 ) {
			return 'linear';
		}

		const scacle = maxMax / minMax;
		if ( scacle > 20 && scacle < 200 ) {
			return 'sqrt';
		} else if ( scacle >= 200 ) {
			return 'log';
		}

		return 'linear';
	}, [ chartData ] );

	const seriesIcons = useMemo(
		() =>
			Object.fromEntries(
				chartData
					.filter( ( series ) => series.icon !== undefined )
					.map( ( series ) => [ series.label, series.icon ] as const )
			),
		[ chartData ]
	);

	const renderTooltip = useCallback(
		( {
			tooltipData,
		}: {
			tooltipData?: {
				nearestDatum?: {
					datum: DataPointDate;
					key: string;
				};
				datumByKey?: { [ key: string ]: { datum: DataPointDate } };
			};
		} ) => {
			const nearestDatum = tooltipData?.nearestDatum?.datum;
			if ( ! nearestDatum ) {
				return null;
			}
			const tooltipPoints = Object.entries( tooltipData?.datumByKey || {} ).map(
				( [ key, { datum } ] ) => ( {
					key,
					value: datum.value as number,
				} )
			);

			const tooltipLabel =
				nearestDatum.label || ( nearestDatum.date && moment( nearestDatum.date ).format( 'LL' ) );

			return (
				<div className="stats-line-chart-tooltip">
					<div className="module-content-list-item is-date-label">{ tooltipLabel }</div>
					<ul>
						{ tooltipPoints.map( ( point ) => (
							<ChartBarTooltip
								key={ point.key }
								label={ point.key }
								value={ formatNumber( point.value ) }
								icon={ seriesIcons[ point.key ] }
							/>
						) ) }
					</ul>
				</div>
			);
		},
		[ moment ]
	);

	const onPointerUp = useCallback(
		( { datum }: EventHandlerParams< DataPointDate > ) => {
			if ( datum && datum.date ) {
				onClick && onClick( { data: { period: moment( datum.date ).format( DATE_FORMAT ) } } );
			}
		},
		[ moment, onClick ]
	);

	return (
		<div className={ clsx( 'stats-line-chart', className ) }>
			{ isEmpty && emptyState }
			{ ! isEmpty && (
				<ThemeProvider theme={ jetpackTheme }>
					<LineChart
						data={ chartData }
						withTooltips
						withGradientFill
						height={ height }
						curveType={ curveType }
						onPointerUp={ onPointerUp }
						margin={ {
							left: 20,
							top: 20,
							bottom: 20,
							right: Math.max( formatValue( maxValue ).length * 10, 40 ), //TODO: we should support this from the lib.
						} }
						options={ {
							yScale: {
								type: yScaleType,
								...( fixedDomain && { domain: [ 0, maxValue ] } ),
								zero: zeroBaseline,
							},
							axis: {
								x: {
									tickFormat: formatTime,
								},
								y: {
									orientation: 'right',
									tickFormat: formatValue,
									numTicks: yNumTicks,
								},
							},
						} }
						renderTooltip={ renderTooltip }
					/>
				</ThemeProvider>
			) }
		</div>
	);
}

export default StatsLineChart;
