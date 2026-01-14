import { Meta, StoryObj } from '@storybook/react';
import { Button, Icon } from '@wordpress/components';
import { cog, layout, page } from '@wordpress/icons';
import EmptyState from './index';

const meta: Meta< typeof EmptyState > = {
	title: 'client/dashboard/EmptyState',
	component: EmptyState,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof EmptyState >;

export const Default: Story = {
	args: {
		title: 'No items yet',
		description: 'Get started by creating your first item.',
		children: (
			<EmptyState.ActionList>
				<EmptyState.ActionItem
					title="Create item"
					description="Set up a new item to see it appear here."
					actions={
						<Button __next40pxDefaultSize variant="primary">
							Create item
						</Button>
					}
				/>
			</EmptyState.ActionList>
		),
	},
};

export const WithMultipleActions: Story = {
	args: {
		title: 'Nothing here yet',
		description: 'Choose one of the options below to get started.',
		children: (
			<EmptyState.ActionList>
				<EmptyState.ActionItem
					title="Create item"
					description="Set up a new item to see it appear here."
					actions={
						<Button __next40pxDefaultSize variant="primary">
							Create item
						</Button>
					}
				/>
				<EmptyState.ActionItem
					title="Learn more"
					description="Read the documentation to understand how this works."
					actions={
						<Button variant="secondary" size="compact">
							View docs
						</Button>
					}
				/>
			</EmptyState.ActionList>
		),
	},
};

export const WithContentBelowActions: Story = {
	args: {
		title: 'No items yet',
		description: 'Get started by creating your first item.',
		children: (
			<>
				<EmptyState.ActionList>
					<EmptyState.ActionItem
						title="Create item"
						description="Set up a new item to see it appear here."
						actions={
							<Button __next40pxDefaultSize variant="primary">
								Create item
							</Button>
						}
					/>
				</EmptyState.ActionList>
				<p style={ { textAlign: 'center', margin: 0 } }>
					You can always change this later in your settings.
				</p>
			</>
		),
	},
};

export const WithIconsAndActions: Story = {
	args: {
		title: 'Set up your site',
		description: 'Choose an option below to start customizing your site.',
		children: (
			<EmptyState.ActionList>
				<EmptyState.ActionItem
					title="Pick a design"
					description="Browse themes and layouts that fit your brand."
					decoration={ <Icon icon={ layout } /> }
					actions={
						<Button variant="secondary" size="compact">
							Browse designs
						</Button>
					}
				/>
				<EmptyState.ActionItem
					title="Create a page"
					description="Start with a new page and add your content."
					decoration={ <Icon icon={ page } /> }
					actions={
						<Button variant="secondary" size="compact">
							New page
						</Button>
					}
				/>
				<EmptyState.ActionItem
					title="Settings"
					description="Adjust advanced options as your site grows."
					decoration={ <Icon icon={ cog } /> }
					actions={
						<Button variant="secondary" size="compact">
							Open settings
						</Button>
					}
				/>
			</EmptyState.ActionList>
		),
	},
};
