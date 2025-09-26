import { LineChart } from '@automattic/charts';

export default function Chart( { data } ) {
	console.log( data );
	const _data: [] = [
		{
			label: 'Label One',
			data: data,
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
			label: 'Label two',
			data: [],
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
