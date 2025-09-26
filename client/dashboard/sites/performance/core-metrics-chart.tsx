import { LineChart } from '@automattic/charts';

interface ChartProps {
	data?: any;
}

export default function CoreMetricsChart( { data }: ChartProps ) {
	
	// Generate dummy data for the last 30 days
	const generateDummyData = ( baseValue: number, variance: number ) => {
		const now = new Date();
		return Array.from( { length: 30 }, ( _, index ) => {
			const date = new Date( now );
			date.setDate( date.getDate() - ( 29 - index ) );
			
			// Add some realistic variance to the data
			const randomVariance = ( Math.random() - 0.5 ) * variance;
			const value = Math.max( 0, baseValue + randomVariance );
			
			return {
				date: date,
				value: Math.round( value * 100 ) / 100, // Round to 2 decimal places
			};
		} );
	};

	const _data: Array<{
		label: string;
		data: Array<{ date: Date; value: number }>;
		options: {
			gradient: {
				from: string;
				to: string;
				fromOpacity: number;
				toOpacity: number;
			};
			stroke: string;
			legendShapeStyle: {
				color: string;
			};
		};
	}> = [
		{
			label: 'Largest Contentful Paint (LCP)',
			data: generateDummyData( 2.5, 0.8 ), // LCP values around 2.5s with variance
			options: {
				gradient: {
					from: '#3858E9',
					to: '#3858E9',
					fromOpacity: 0.2,
					toOpacity: 0,
				},
				stroke: '#3858E9',
				legendShapeStyle: {
					color: '#3858E9',
				},
			},
		},
		{
			label: 'First Input Delay (FID)',
			data: generateDummyData( 100, 50 ), // FID values around 100ms with variance
			options: {
				gradient: {
					from: '#5BA300',
					to: '#5BA300',
					fromOpacity: 0.2,
					toOpacity: 0,
				},
				stroke: '#5BA300',
				legendShapeStyle: {
					color: '#5BA300',
				},
			},
		},
		{
			label: 'Cumulative Layout Shift (CLS)',
			data: generateDummyData( 0.1, 0.05 ), // CLS values around 0.1 with variance
			options: {
				gradient: {
					from: '#D63638',
					to: '#D63638',
					fromOpacity: 0.2,
					toOpacity: 0,
				},
				stroke: '#D63638',
				legendShapeStyle: {
					color: '#D63638',
				},
			},
		},
	];

	return (
		<LineChart
			data={ _data }
			withGradientFill
			height={ 450 }
			maxWidth={ 1400 }
			showLegend
			withLegendGlyph
		/>
	);
}
