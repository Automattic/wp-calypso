import { Meta, StoryObj } from '@storybook/react';
import { Button, Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import ActionList from './index';

const meta: Meta< typeof ActionList > = {
	title: 'client/dashboard/ActionList',
	component: ActionList,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof ActionList >;

export const Default: Story = {
	args: {
		children: (
			<ActionList.ActionItem
				title="Action item title"
				description="Action item description"
				actions={
					<Button variant="secondary" size="compact">
						Action
					</Button>
				}
			/>
		),
	},
};

export const WithTitle: Story = {
	args: {
		title: 'Action List',
		children: (
			<ActionList.ActionItem
				title="Action item title"
				description="Action item description"
				actions={
					<Button variant="secondary" size="compact">
						Action
					</Button>
				}
			/>
		),
	},
};

export const WithDescription: Story = {
	args: {
		title: 'Action List',
		description: 'description',
		children: (
			<ActionList.ActionItem
				title="Action item title"
				description="Action item description"
				actions={
					<Button variant="secondary" size="compact">
						Action
					</Button>
				}
			/>
		),
	},
};

export const WithMultipleActionItems: Story = {
	args: {
		title: 'Action List',
		description: 'description',
		children: (
			<>
				<ActionList.ActionItem
					title="Action item title"
					description="Action item description"
					actions={
						<Button variant="secondary" size="compact">
							Action
						</Button>
					}
				/>
				<ActionList.ActionItem
					title="Action item title"
					description="Action item description"
					actions={
						<Button variant="secondary" size="compact">
							Action
						</Button>
					}
				/>
			</>
		),
	},
};

export const FullExample: Story = {
	args: {
		title: 'Action List',
		description: 'description',
		children: (
			<>
				<ActionList.ActionItem
					title="Action item title"
					description="Action item description"
					actions={
						<Button variant="secondary" size="compact">
							Action
						</Button>
					}
				/>
				<ActionList.ActionItem
					title="Action item title"
					description="Action item description"
					actions={
						<>
							<Button variant="secondary" size="compact">
								Action 1
							</Button>
							<Button variant="secondary" size="compact" isDestructive>
								Action 2
							</Button>
						</>
					}
				/>
				<ActionList.ActionItem
					title="Action item title"
					description="Action item description"
					decoration={ <Icon icon={ cog } /> }
					actions={
						<Button variant="secondary" size="compact">
							Action
						</Button>
					}
				/>
				<ActionList.ActionItem
					title="Action item title"
					description="Action item description"
					decoration={ <Icon icon={ <img src="https://placecats.com/300/200" alt="Cat" /> } /> }
					actions={
						<Button variant="secondary" size="compact">
							Action
						</Button>
					}
				/>
			</>
		),
	},
};
