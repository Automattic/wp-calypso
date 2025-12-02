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

export const WithImage: Story = {
	args: {
		title: 'Icon list item title',
		description: 'Icon list item description',
		decoration: <Icon icon={ <img src="https://placecats.com/300/200" alt="Cat" /> } />,
	},
};

export const WithoutDescription: Story = {
	args: {
		title: 'Icon list item title',
		decoration: <Icon icon={ cog } />,
	},
};
