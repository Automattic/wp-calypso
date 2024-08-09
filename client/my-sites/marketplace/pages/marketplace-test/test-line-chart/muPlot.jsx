import { useRef } from 'react';
import UplotReact from 'uplot-react';
import serverData from './data/mobile.json';

const { collectionPeriods, metrics } = serverData.history;

const timeData = collectionPeriods.map(
	( p ) => new Date( p.lastDate.year, p.lastDate.month - 1, p.lastDate.day ).getTime() / 1000
);

const valueData = metrics.first_contentful_paint.percentilesTimeseries.p75s;

const data = [ timeData, valueData ];
const opts = {
	title: 'My Chart',
	// id: 'chart1',
	// class: 'my-chart',
	width: 600,
	height: 400,
	series: [
		{},
		{
			// in-legend display
			label: 'FCP',
			// series style
			stroke: 'red',
			dash: [ 10, 5 ],
		},
	],
};

export default () => {
	const uplotContainer = useRef( null );

	return (
		<div ref={ uplotContainer }>
			<UplotReact data={ data } options={ opts } target={ uplotContainer.current } />
			{ /* <pre>{ JSON.stringify( data, null, 2 ) }</pre> */ }
		</div>
	);
};
