import { LineChart, ThemeProvider, jetpackTheme } from '@automattic/charts';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsEmptyState from '../../stats-empty-state';

function StatsLineChart( {
	chartData = [],
	maxViews = 1,
	formatTimeTick,
	className,
	height = 400,
	moment,
	EmptyState = StatsEmptyState,
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
} ) {
	const translate = useTranslate();

	const formatTime = formatTimeTick
		? formatTimeTick
		: ( value: number ) => {
				const date = new Date( value );
				return new Date( date ).toLocaleTimeString( moment.locale(), {
					hour: '2-digit',
					minute: '2-digit',
					hour12: true,
				} );
		  };

	const formatViews = ( value: number ) => {
		return value.toFixed( 0 ).toString();
	};

	const dataSeries = chartData?.[ 0 ].data || [];

	return (
		<div className={ clsx( 'stats-line-chart', className ) }>
			{ dataSeries.length === 0 && (
				<EmptyState
					headingText={ translate( 'Real-time views' ) }
					infoText={ translate( 'Collecting data… auto-refreshing in a minute…' ) }
				/>
			) }
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
							domain: [ 0, maxViews ],
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
		</div>
	);
}

export default withLocalizedMoment( StatsLineChart );
