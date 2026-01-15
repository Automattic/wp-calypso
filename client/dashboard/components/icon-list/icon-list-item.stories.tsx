import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import IconListItem from './icon-list-item';

const meta: Meta< typeof IconListItem > = {
	title: 'client/dashboard/IconList/IconListItem',
	component: IconListItem,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof IconListItem >;

export const Default: Story = {
	args: {
		title: 'Icon list item title',
		description: 'Icon list item description',
	},
};

export const WithIcon: Story = {
	args: {
		title: 'Icon list item title',
		description: 'Icon list item description',
		decoration: <Icon icon={ cog } />,
	},
};

export const WithoutDescription: Story = {
	args: {
		title: 'Icon list item title',
		decoration: <Icon icon={ cog } />,
	},
};

export const DensityLow: Story = {
	args: {
		title: 'Low density item',
		description: 'More spacing between elements',
		decoration: <Icon icon={ cog } />,
		density: 'low',
	},
};

export const DensityMedium: Story = {
	args: {
		title: 'Medium density item',
		description: 'Default spacing between elements',
		decoration: <Icon icon={ cog } />,
		density: 'medium',
	},
};

export const DensityHigh: Story = {
	args: {
		title: 'High density item',
		description: 'Tighter spacing between elements',
		decoration: <Icon icon={ cog } />,
		density: 'high',
	},
};
