import { LineChart, ThemeProvider, jetpackTheme } from '@automattic/charts';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsEmptyState from '../../stats-empty-state';

function StatsLineChart( {
	chartData = [],
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
	className?: string;
	height?: number;
	moment: Moment;
	EmptyState: typeof StatsEmptyState;
} ) {
	const translate = useTranslate();
	const formatTime = ( value: number ) => {
		const date = new Date( value );
		return new Date( date ).toLocaleTimeString( moment.locale(), {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		} );
	};

	return (
		<div className={ clsx( 'stats-line-chart', className ) }>
			{ chartData?.[ 0 ].data?.length === 0 && (
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
					options={ { axis: { x: { tickFormat: formatTime }, y: { orientation: 'right' } } } }
				/>
			</ThemeProvider>
		</div>
	);
}

export default withLocalizedMoment( StatsLineChart );
