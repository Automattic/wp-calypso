import { ThemeProvider, jetpackTheme, wooTheme } from '../../../providers/theme';
import { PieChart } from '../index';
import type { Meta, StoryObj } from '@storybook/react';

const data = [
	{ label: 'A', value: 30 },
	{ label: 'B', value: 20 },
	{ label: 'C', value: 15 },
	{ label: 'D', value: 35 },
];

type StoryType = StoryObj< typeof PieChart >;

export default {
	title: 'JS Packages/Charts/Types/Pie Chart',
	component: PieChart,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		theme: {
			control: 'select',
			options: {
				default: undefined,
				jetpack: jetpackTheme,
				woo: wooTheme,
			},
			defaultValue: undefined,
		},
	},
	decorators: [
		( Story, { args } ) => (
			<ThemeProvider theme={ args.theme }>
				<div style={ { padding: '2rem' } }>
					<Story />
				</div>
			</ThemeProvider>
		),
	],
} satisfies Meta< typeof PieChart >;

export const Default: StoryType = {
	args: {
		width: 400,
		height: 400,
		withTooltips: false,
		data,
		theme: 'default',
		innerRadius: 0,
		showLegend: false,
		legendOrientation: 'horizontal',
	},
};

export const WithHorizontalLegend: StoryType = {
	args: {
		...Default.args,
		showLegend: true,
		legendOrientation: 'horizontal',
	},
};

export const WithVerticalLegend: StoryType = {
	args: {
		...Default.args,
		showLegend: true,
		legendOrientation: 'vertical',
	},
};

export const Doughnut: StoryType = {
	args: {
		...Default.args,
		innerRadius: 80,
	},
	parameters: {
		docs: {
			description: {
				story: 'Doughnut chart variant with inner radius of 80px.',
			},
		},
	},
};

export const WithTooltips: StoryType = {
	args: {
		...Default.args,
		withTooltips: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Pie chart with interactive tooltips that appear on hover.',
			},
		},
	},
};

export const WithTooltipsDoughnut: StoryType = {
	args: {
		...Default.args,
		withTooltips: true,
		innerRadius: 100,
	},
	parameters: {
		docs: {
			description: {
				story: 'Doughnut chart with interactive tooltips that appear on hover.',
			},
		},
	},
};
