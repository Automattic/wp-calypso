import { LineChart } from '../index';
import sampleData from './sample-data';
import type { Meta } from '@storybook/react';

export default {
	title: 'JS Packages/Charts/Types/Line Chart',
	component: LineChart,
	parameters: {
		layout: 'centered',
	},
	decorators: [
		Story => (
			<div style={ { padding: '2rem' } }>
				<Story />
			</div>
		),
	],
} satisfies Meta< typeof LineChart >;

const Template = args => <LineChart { ...args } />;

// Default story with multiple series
export const Default = Template.bind( {} );
Default.args = {
	width: 500,
	height: 300,
	data: sampleData,
	showLegend: false,
	legendOrientation: 'horizontal',
};

// Story with single data series
export const SingleSeries = Template.bind( {} );
SingleSeries.args = {
	width: 500,
	height: 300,
	data: [ sampleData[ 0 ] ], // Only London temperature data
};

// Story without tooltip
export const WithoutTooltip = Template.bind( {} );
WithoutTooltip.args = {
	...Default.args,
	withTooltips: false,
};

// Story with custom dimensions
export const CustomDimensions = Template.bind( {} );
CustomDimensions.args = {
	width: 800,
	height: 400,
	data: sampleData,
};

// Story with horizontal legend
export const WithLegend = Template.bind( {} );
WithLegend.args = {
	...Default.args,
	showLegend: true,
};

// Story with vertical legend
export const WithVerticalLegend = Template.bind( {} );
WithVerticalLegend.args = {
	...Default.args,
	showLegend: true,
	legendOrientation: 'vertical',
};
