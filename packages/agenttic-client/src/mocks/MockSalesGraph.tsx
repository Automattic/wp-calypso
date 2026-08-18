import React from 'react';
// NOTE: BarChart has been moved to @automattic/agenttic-ui
// For now, we'll render a placeholder
// import { BarChart } from '@automattic/agenttic-ui';

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
} ) => {
	const totalSales = data.reduce( ( sum, item ) => sum + item.sales, 0 );
	const avgSales = Math.round( totalSales / data.length );

	// Placeholder: BarChart moved to @automattic/agenttic-ui
	return (
		<div
			style={ {
				padding: '20px',
				background: '#f5f5f5',
				borderRadius: '8px',
			} }
		>
			<h3>{ title }</h3>
			<p>
				Total: ${ totalSales.toLocaleString() } | Avg: $
				{ avgSales.toLocaleString() }
			</p>
			<ul style={ { listStyle: 'none', padding: 0 } }>
				{ data.map( ( item ) => (
					<li key={ item.product }>
						{ item.product }: ${ item.sales.toLocaleString() }
					</li>
				) ) }
			</ul>
		</div>
	);
};
