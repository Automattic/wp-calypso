import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import ActionItem from './index';

const meta = {
	title: 'ActionItem',
	component: ActionItem,
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof ActionItem >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Action title',
		description: 'Action description',
		decoration: <Icon icon={ cog } />,
		actionLabel: 'Action',
	},
};

export const IsDestructive: Story = {
	args: {
		title: 'Action title',
		description: 'Action description',
		decoration: <Icon icon={ cog } />,
		actionLabel: 'Action',
		isDestructive: true,
	},
};
