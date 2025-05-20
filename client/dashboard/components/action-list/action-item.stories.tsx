import { Meta, StoryObj } from '@storybook/react';
import { Button, Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import ActionItem from './action-item';

const meta = {
	title: 'client/dashboard/ActionList/ActionItem',
	component: ActionItem,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof ActionItem >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Action item title',
		description: 'Action item description',
		actions: (
			<Button variant="secondary" size="compact">
				Action
			</Button>
		),
	},
};

export const WithMultipleActions: Story = {
	args: {
		title: 'Action item title',
		description: 'Action item description',
		actions: (
			<>
				<Button variant="secondary" size="compact">
					Action 1
				</Button>
				<Button variant="secondary" size="compact" isDestructive>
					Action 2
				</Button>
			</>
		),
	},
};

export const WithIcon: Story = {
	args: {
		title: 'Action item title',
		description: 'Action item description',
		decoration: <Icon icon={ cog } />,
		actions: (
			<Button variant="secondary" size="compact">
				Action
			</Button>
		),
	},
};

export const WithImage: Story = {
	args: {
		title: 'Action item title',
		description: 'Action item description',
		decoration: <Icon icon={ <img src="https://placecats.com/300/200" alt="Cat" /> } />,
		actions: (
			<Button variant="secondary" size="compact">
				Action
			</Button>
		),
	},
};
