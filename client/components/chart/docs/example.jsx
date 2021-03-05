/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Chart from '../index';

function ChartExample() {
	const chartData = [
		{
			label: '2018',
			value: 7416852578,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2018',
					value: 7416852578,
					icon: 'globe',
				},
			],
		},
		{
			label: '2019',
			value: 7487663656,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2019',
					value: 7487663656,
					icon: 'globe',
				},
			],
		},
		{
			label: '2020',
			value: 7557514266,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2020',
					value: 7557514266,
					icon: 'globe',
				},
			],
		},
		{
			label: '2021',
			value: 7626477056,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2021',
					value: 7626477056,
					icon: 'globe',
				},
			],
		},
		{
			label: '2022',
			value: 7694592508,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2022',
					value: 7694592508,
					icon: 'globe',
				},
			],
		},
		{
			label: '2023',
			value: 7761728812,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2023',
					value: 7761728812,
					icon: 'globe',
				},
			],
		},
		{
			label: '2024',
			value: 7827803562,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2024',
					value: 7827803562,
					icon: 'globe',
				},
			],
		},
		{
			label: '2025',
			value: 7892758722,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2025',
					value: 7892758722,
					icon: 'globe',
				},
			],
		},
		{
			label: '2026',
			value: 7956667160,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2026',
					value: 7956667160,
					icon: 'globe',
				},
			],
		},
		{
			label: '2027',
			value: 8019596128,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2027',
					value: 8019596128,
					icon: 'globe',
				},
			],
		},
		{
			label: '2028',
			value: 8081508492,
			tooltipData: [
				{
					label: 'Global population',
				},
				{
					label: '2028',
					value: 8081508492,
					icon: 'globe',
				},
			],
		},
	];

	return <Chart loading={ false } data={ chartData } />;
}

ChartExample.displayName = 'Chart';

export default ChartExample;
