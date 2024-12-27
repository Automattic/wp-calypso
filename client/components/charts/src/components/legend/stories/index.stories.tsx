import { Meta, StoryObj } from '@storybook/react';
import { BaseLegend } from '../base-legend';

const meta: Meta< typeof BaseLegend > = {
	title: 'JS Packages/Charts/Composites/Legend',
	component: BaseLegend,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A flexible legend component that can be customized with different styles and orientations.',
			},
		},
	},
};

export default meta;
type Story = StoryObj< typeof BaseLegend >;

const mockData = [
	{ label: 'Desktop', value: '86%', color: '#3858E9' },
	{ label: 'Mobile', value: '52%', color: '#80C8FF' },
];

export const Horizontal: Story = {
	args: {
		items: mockData,
		orientation: 'horizontal',
	},
};

export const Vertical: Story = {
	args: {
		items: mockData,
		orientation: 'vertical',
	},
};

export const WithLongLabels: Story = {
	args: {
		items: [
			{ label: 'Very Long Desktop Usage', value: '86%', color: '#3858E9' },
			{ label: 'Extended Mobile Sessions', value: '52%', color: '#80C8FF' },
			{ label: 'Tablet Device Access', value: '35%', color: '#44B556' },
		],
		orientation: 'horizontal',
	},
};
