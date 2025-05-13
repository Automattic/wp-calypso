import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import ActionItem from './index';

const meta = {
	title: 'client/dashboard/ActionItem',
	component: ActionItem,
	tags: [ 'autodocs' ],
} satisfies Meta< typeof ActionItem >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Action title',
		description: 'Action description',
		action: {
			label: 'Action',
			callback: () => {},
		},
	},
};

export const IsDestructive: Story = {
	args: {
		title: 'Destructive action title',
		description: 'Destructive action description',
		action: {
			label: 'Delete',
			isDestructive: true,
			RenderModal: () => <div>Are you sure you want to delete</div>,
		},
	},
};

export const WithIcon: Story = {
	args: {
		title: 'Action title',
		description: 'Action description',
		decoration: <Icon icon={ cog } />,
		action: {
			label: 'Action',
			callback: () => {},
		},
	},
};
