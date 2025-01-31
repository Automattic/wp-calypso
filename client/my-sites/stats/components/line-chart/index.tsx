import { LineChart, ThemeProvider } from '@automattic/charts';
import { useEffect, useState } from 'react';

let index = 0;
const baseDate = new Date( '2024-01-30T09:00:00' );
const fixtureData = [
	{
		label: 'Views',
		options: {
			stroke: '#069e08',
		},
		data: [],
	},
];

function StatsLineChart( { chartData = null, height = 400 } ) {
	const [ data, setData ] = useState( () => chartData || fixtureData );
	const formatTime = ( value: number ) => {
		const date = new Date( value );
		return new Date( date ).toLocaleTimeString( 'en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		} );
	};

	useEffect( () => {
		setInterval( () => {
			if ( fixtureData[ 0 ].data.length > 30 ) {
				fixtureData[ 0 ].data.pop();
			}

			const date = new Date( baseDate );
			date.setMinutes( date.getMinutes() + index++ );
			fixtureData[ 0 ].data.unshift( { date, value: Math.round( Math.random() * 1000 ) } );
			setData( [ ...fixtureData ] );
		}, 1000 );
	}, [] );

	return (
		<ThemeProvider
			theme={ {
				backgroundColor: '#FFFFFF', // chart background color
				labelBackgroundColor: '#FFFFFF', // label background color
				colors: [ '#98C8DF', '#006DAB', '#A6DC80', '#1F9828', '#FF8C8F' ],
				gridStyles: {
					stroke: '#DCDCDE',
					strokeWidth: 1,
				},
				tickLength: 4,
				gridColor: '',
				gridColorDark: '',
				xTickLineStyles: { stroke: 'black' },
				xAxisLineStyles: { stroke: '#DCDCDE', strokeWidth: 1 },
			} }
		>
			<LineChart
				data={ data }
				withTooltips
				withGradientFill
				height={ height }
				margin={ { left: 10 } }
				options={ { axis: { x: { tickFormat: formatTime }, y: { orientation: 'right' } } } }
			/>
		</ThemeProvider>
	);
}

export default StatsLineChart;
