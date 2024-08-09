import {
	Chart,
	LineController,
	LineElement,
	PointElement,
	LinearScale,
	CategoryScale,
	Title,
} from 'chart.js';
import React, { useEffect, useRef, forwardRef } from 'react';
import serverData from './data/mobile.json';
import { reforwardRef, cloneData, setOptions, setLabels, setDatasets } from './utils.ts';

const { collectionPeriods, metrics } = serverData.history;

Chart.register( LineController, LineElement, PointElement, LinearScale, CategoryScale, Title );

function ChartComponent( props, ref ) {
	const {
		height = 150,
		width = 300,
		redraw = false,
		datasetIdKey,
		type,
		data,
		options,
		plugins = [],
		fallbackContent,
		updateMode,
		...canvasProps
	} = props;
	const canvasRef = useRef( null );
	const chartRef = useRef();

	const renderChart = () => {
		if ( ! canvasRef.current ) {
			return;
		}

		chartRef.current = new Chart( canvasRef.current, {
			type,
			data: cloneData( data, datasetIdKey ),
			options: options && { ...options },
			plugins,
		} );

		reforwardRef( ref, chartRef.current );
	};

	const destroyChart = () => {
		reforwardRef( ref, null );

		if ( chartRef.current ) {
			chartRef.current.destroy();
			chartRef.current = null;
		}
	};

	useEffect( () => {
		if ( ! redraw && chartRef.current && options ) {
			setOptions( chartRef.current, options );
		}
	}, [ redraw, options ] );

	useEffect( () => {
		if ( ! redraw && chartRef.current ) {
			setLabels( chartRef.current.config.data, data.labels );
		}
	}, [ redraw, data.labels ] );

	useEffect( () => {
		if ( ! redraw && chartRef.current && data.datasets ) {
			setDatasets( chartRef.current.config.data, data.datasets, datasetIdKey );
		}
	}, [ redraw, data.datasets ] );

	useEffect( () => {
		if ( ! chartRef.current ) {
			return;
		}

		if ( redraw ) {
			destroyChart();
			setTimeout( renderChart );
		} else {
			chartRef.current.update( updateMode );
		}
	}, [ redraw, options, data.labels, data.datasets, updateMode ] );

	useEffect( () => {
		if ( ! chartRef.current ) {
			return;
		}

		destroyChart();
		setTimeout( renderChart );
	}, [ type ] );

	useEffect( () => {
		renderChart();

		return () => destroyChart();
	}, [] );

	return (
		<canvas ref={ canvasRef } role="img" height={ height } width={ width } { ...canvasProps }>
			{ fallbackContent }
		</canvas>
	);
}

export const MyChart = forwardRef( ChartComponent );

const timeData = collectionPeriods.map(
	( p ) => new Date( p.lastDate.year, p.lastDate.month - 1, p.lastDate.day ).getTime() / 1000
);

const valueData = metrics.first_contentful_paint.percentilesTimeseries.p75s;

function generatePointStyle( ctx ) {
	const index = ctx.dataIndex;
	const value = ctx.dataset.data[ index ];
	if ( value < 1280 ) {
		return 'circle';
	}
	if ( value < 1300 ) {
		return 'triangle';
	}
	return 'rect';
}

export default () => {
	const data = {
		labels: timeData,
		datasets: [
			{
				label: 'My First Dataset',
				data: valueData,
			},
		],
	};
	const options = {
		elements: {
			line: { backgroundColor: 'rgb(75, 192, 192)', borderColor: 'rgb(75, 192, 192)' },
			point: {
				backgroundColor: 'rgb(255, 255, 255)',
				borderColor: 'black',
				pointStyle: generatePointStyle,
				pointRadius: 7,
			},
		},
	};
	return <MyChart type="line" data={ data } options={ options } />;
};
