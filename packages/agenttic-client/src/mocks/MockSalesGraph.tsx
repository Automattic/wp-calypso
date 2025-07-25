import React from 'react';
import { BarChart } from '../markdown-extensions/charts';

interface SalesData {
	product: string;
	sales: number;
}

interface MockSalesGraphProps {
	title: string;
	data: SalesData[];
	timeframe?: string;
}

export const MockSalesGraph: React.FC< MockSalesGraphProps > = ( {
	title,
	data,
	timeframe,
} ) => {
	// Transform data to chart format
	const chartData = [
		{
			name: title,
			label: title, // SeriesData requires a label property
			data: data.map( ( item ) => ( {
				label: item.product,
				value: item.sales,
			} ) ),
		},
	];

	const totalSales = data.reduce( ( sum, item ) => sum + item.sales, 0 );
	const avgSales = Math.round( totalSales / data.length );

	return (
		<BarChart
			data={ chartData }
			mode="item-comparison"
			truncateLabels={ true }
			maxLabelLength={ 15 }
			showLegend={ false }
		/>
	);
};
