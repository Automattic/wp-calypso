import { LineChart, ThemeProvider, jetpackTheme } from '@automattic/charts';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import StatsEmptyState from '../../stats-empty-state';

function StatsLineChart( {
	chartData = [],
	maxViews = 1,
	formatTimeTick,
	className,
	height = 400,
	EmptyState = StatsEmptyState,
	zeroBaseline = true,
	fixedDomain = false,
}: {
	chartData: Array< {
		label: string;
		options: object;
		data: Array< { date: Date; value: number } >;
	} >;
	maxViews?: number;
	formatTimeTick?: ( value: number ) => string;
	className?: string;
	height?: number;
	moment: Moment;
	EmptyState: typeof StatsEmptyState;
	zeroBaseline?: boolean;
	fixedDomain?: boolean;
} ) {
	const translate = useTranslate();

	const formatTime = formatTimeTick
		? formatTimeTick
		: ( value: number ) => {
				const date = new Date( value );
				return date.toLocaleDateString( undefined, {
					month: 'short',
					day: 'numeric',
				} );
		  };

	const formatViews = ( value: number ) => {
		return value.toFixed( 0 ).toString();
	};

	const isEmpty = ( chartData?.[ 0 ].data || [] ).length === 0;

	return (
		<div className={ clsx( 'stats-line-chart', className ) }>
			{ isEmpty && (
				<EmptyState
					headingText={ translate( 'Real-time views' ) }
					infoText={ translate( 'Collecting data… auto-refreshing in a minute…' ) }
				/>
			) }
			{ ! isEmpty && (
				<ThemeProvider theme={ jetpackTheme }>
					<LineChart
						data={ chartData }
						withTooltips
						withGradientFill
						height={ height }
						/** naturalCurve sometime goes off the grid :( */
						margin={ { left: 15, top: 20, bottom: 20 } }
						options={ {
							yScale: {
								type: 'linear',
								...( fixedDomain && { domain: [ 0, maxViews ] } ),
								zero: zeroBaseline,
							},
							axis: {
								x: {
									tickFormat: formatTime,
								},
								y: {
									orientation: 'right',
									tickFormat: formatViews,
									numTicks: maxViews > 4 ? 4 : 1,
								},
							},
						} }
					/>
				</ThemeProvider>
			) }
		</div>
	);
}

export default StatsLineChart;
