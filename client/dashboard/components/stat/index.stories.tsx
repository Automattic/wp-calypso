import { Meta, StoryObj } from '@storybook/react';
import { Stat } from './';

const meta: Meta< typeof Stat > = {
	title: 'client/dashboard/Stat',
	component: Stat,
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof Stat >;

export const WithProgress: Story = {
	args: {
		density: 'low',
		strapline: 'Storage',
		metric: '1.3 GB',
		description: '5 GB',
		progressValue: ( 100 * 1.3 ) / 5,
	},
};

export const NoProgress: Story = {
	args: {
		density: 'low',
		strapline: 'Views',
		metric: '1.3 M',
		description: '33% left',
	},
};

export const Loading: Story = {
	args: {
		isLoading: true,
		density: 'low',
		strapline: 'Storage',
		metric: '1.3 GB',
		description: '5 GB',
		progressValue: 50,
	},
};
