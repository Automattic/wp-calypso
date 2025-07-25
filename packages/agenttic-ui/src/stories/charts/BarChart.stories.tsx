import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ChartBlock } from '@automattic/agenttic-client';

const meta = {
	title: 'Markdown Extensions/Charts/Bar Chart',
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
 * Default bar chart showing item comparison data
 */
export const Default: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'bar',
			title: 'Sales by Category',
			mode: 'item-comparison',
			data: [
				{
					label: 'Sales by Category',
					data: [
						{ label: 'Electronics', value: 850 },
						{ label: 'Clothing', value: 620 },
						{ label: 'Home & Garden', value: 450 },
						{ label: 'Sports & Outdoors', value: 380 },
						{ label: 'Books & Media', value: 280 },
						{ label: 'Health & Beauty', value: 520 },
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
 * Time comparison bar chart showing data over time periods
 */
export const TimeComparison: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'bar',
			title: 'Monthly Revenue',
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
 * Bar chart with currency formatting
 */
export const WithCurrency: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'bar',
			title: 'Revenue by Region',
			mode: 'item-comparison',
			data: [
				{
					label: 'Revenue ($)',
					data: [
						{ label: 'North America', value: 125000 },
						{ label: 'Europe', value: 98000 },
						{ label: 'Asia Pacific', value: 142000 },
						{ label: 'Latin America', value: 67000 },
						{ label: 'Middle East & Africa', value: 45000 },
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
 * Bar chart without title demonstration
 */
export const NoTitle: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'bar',
			mode: 'item-comparison',
			data: [
				{
					label: 'Sample Data',
					data: [
						{ label: 'Category A', value: 100 },
						{ label: 'Category B', value: 150 },
						{ label: 'Category C', value: 75 },
						{ label: 'Category D', value: 125 },
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
 * Error state demonstration with invalid data structure
 */
export const ErrorState: Story = {
	args: {
		data: JSON.stringify( {
			chartType: 'bar',
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
