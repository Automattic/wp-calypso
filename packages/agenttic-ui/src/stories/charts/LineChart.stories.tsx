import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ChartBlock } from '@automattic/agenttic-client';

const meta = {
	title: 'Markdown Extensions/Charts/Line Chart',
	component: ChartBlock,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		data: {
			control: 'text',
			description: 'JSON string containing chart configuration',
		},
		config: {
			control: 'object',
			description: 'Optional chart extension configuration',
		},
	},
	args: {
		config: undefined,
	},
} satisfies Meta< typeof ChartBlock >;

export default meta;
type Story = StoryObj< typeof meta >;

/**
 * Default line chart showing time-series data
 */
export const Default: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'line',
			title: 'Monthly Revenue Trend',
			mode: 'time-comparison',
			data: [
				{
					label: 'Revenue',
					data: [
						{ date: '2024-01-01', value: 45000 },
						{ date: '2024-02-01', value: 52000 },
						{ date: '2024-03-01', value: 48000 },
						{ date: '2024-04-01', value: 61000 },
						{ date: '2024-05-01', value: 58000 },
						{ date: '2024-06-01', value: 62000 },
					],
				},
			],
		} ),
	},
	render: ( args ) => (
		<div
			style={ {
				width: '360px', // Typical chat container width
				padding: '16px',
				border: '1px solid #e1e5e9',
				borderRadius: '8px',
				backgroundColor: '#ffffff',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
				margin: '16px auto',
			} }
		>
			<ChartBlock { ...args } />
		</div>
	),
};

/**
 * Multi-series line chart with revenue and visitors
 */
export const MultiSeries: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'line',
			title: 'Revenue & Traffic Overview',
			mode: 'time-comparison',
			data: [
				{
					label: 'Revenue ($)',
					data: [
						{ date: '2024-06-01', value: 125000 },
						{ date: '2024-06-02', value: 132000 },
						{ date: '2024-06-03', value: 118000 },
						{ date: '2024-06-04', value: 145000 },
						{ date: '2024-06-05', value: 156000 },
						{ date: '2024-06-06', value: 162000 },
						{ date: '2024-06-07', value: 148000 },
					],
				},
				{
					label: 'Visitors',
					data: [
						{ date: '2024-06-01', value: 45000 },
						{ date: '2024-06-02', value: 48000 },
						{ date: '2024-06-03', value: 42000 },
						{ date: '2024-06-04', value: 52000 },
						{ date: '2024-06-05', value: 55000 },
						{ date: '2024-06-06', value: 58000 },
						{ date: '2024-06-07', value: 51000 },
					],
				},
			],
		} ),
	},
	render: ( args ) => (
		<div
			style={ {
				width: '600px', // Wider for better multi-series display
				padding: '16px',
				border: '1px solid #e1e5e9',
				borderRadius: '8px',
				backgroundColor: '#ffffff',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
				margin: '16px auto',
			} }
		>
			<ChartBlock { ...args } />
		</div>
	),
};

/**
 * Line chart with currency formatting
 */
export const WithCurrency: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'line',
			title: 'Daily Sales',
			mode: 'time-comparison',
			data: [
				{
					label: 'Sales ($)',
					data: [
						{ date: '2024-06-01', value: 2500 },
						{ date: '2024-06-02', value: 3200 },
						{ date: '2024-06-03', value: 2800 },
						{ date: '2024-06-04', value: 3100 },
						{ date: '2024-06-05', value: 3500 },
						{ date: '2024-06-06', value: 4200 },
						{ date: '2024-06-07', value: 3800 },
					],
				},
			],
			currency: {
				symbol: '$',
				symbolPosition: 'left',
			},
		} ),
	},
	render: ( args ) => (
		<div
			style={ {
				width: '360px', // Typical chat container width
				padding: '16px',
				border: '1px solid #e1e5e9',
				borderRadius: '8px',
				backgroundColor: '#ffffff',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
				margin: '16px auto',
			} }
		>
			<ChartBlock { ...args } />
		</div>
	),
};

/**
 * Line chart without title
 */
export const NoTitle: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'line',
			mode: 'time-comparison',
			data: [
				{
					label: 'Visitors',
					data: [
						{ date: '2024-06-01', value: 1200 },
						{ date: '2024-06-02', value: 1350 },
						{ date: '2024-06-03', value: 1100 },
						{ date: '2024-06-04', value: 1450 },
						{ date: '2024-06-05', value: 1380 },
						{ date: '2024-06-06', value: 1520 },
					],
				},
			],
		} ),
	},
	render: ( args ) => (
		<div
			style={ {
				width: '360px', // Typical chat container width
				padding: '16px',
				border: '1px solid #e1e5e9',
				borderRadius: '8px',
				backgroundColor: '#ffffff',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
				margin: '16px auto',
			} }
		>
			<ChartBlock { ...args } />
		</div>
	),
};

/**
 * Error state demonstration
 */
export const ErrorState: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'line',
			title: 'Error State Example',
			data: [],
		} ),
	},
	render: ( args ) => (
		<div
			style={ {
				width: '360px', // Typical chat container width
				padding: '16px',
				border: '1px solid #e1e5e9',
				borderRadius: '8px',
				backgroundColor: '#ffffff',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
				margin: '16px auto',
			} }
		>
			<ChartBlock { ...args } />
		</div>
	),
};
