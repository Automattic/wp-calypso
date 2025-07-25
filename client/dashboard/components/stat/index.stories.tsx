import { Meta, StoryObj } from '@storybook/react';
import { Stat } from './';

const meta: Meta< typeof Stat > = {
	title: 'client/dashboard/Stat',
	component: Stat,
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof Stat >;

export const Default: Story = {
	args: {
		density: 'low',
		strapline: 'Views',
		metric: '1.3 M',
		description: '33% left',
		descriptionAlignment: 'start',
		progressValue: 15,
	},
};
