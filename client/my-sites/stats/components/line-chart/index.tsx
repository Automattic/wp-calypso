import { LineChart, ThemeProvider, jetpackTheme } from '@automattic/charts';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { useEffect, useState } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsEmptyState from '../../stats-empty-state';

const fixtureData = [
	{
		label: 'Views',
		options: {
			stroke: '#069e08',
		},
		data: [] as Array< { date: Date; value: number } >,
	},
];

function StatsLineChart( {
	chartData = null,
	height = 400,
	moment,
	EmptyState = StatsEmptyState,
}: {
	chartData: Array< {
		label: string;
		options: object;
		data: Array< { date: Date; value: number } >;
	} > | null;
	height?: number;
	moment: Moment;
	EmptyState: typeof StatsEmptyState;
} ) {
	const [ data, setData ] = useState( () => chartData || fixtureData );
	const formatTime = ( value: number ) => {
		const date = new Date( value );
		return new Date( date ).toLocaleTimeString( moment.locale(), {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		} );
	};
	const translate = useTranslate();

	useEffect( () => {
		const intervalId = setInterval( () => {
			if ( fixtureData[ 0 ].data.length > 30 ) {
				fixtureData[ 0 ].data.pop();
			}

			const date = new Date();
			fixtureData[ 0 ].data.unshift( { date, value: Math.round( Math.random() * 60 ) } );
			setData( [ ...fixtureData ] );
		}, 60 * 1000 );
		return () => clearInterval( intervalId );
	}, [] );

	return (
		<div className="stats-line-chart">
			{ data?.[ 0 ]?.data?.length === 0 && (
				<EmptyState
					headingText={ translate( 'Real-time views' ) }
					infoText={ translate( 'Collecting data… auto-refreshing in a minute…' ) }
				/>
			) }
			<ThemeProvider theme={ jetpackTheme }>
				<LineChart
					data={ data }
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
