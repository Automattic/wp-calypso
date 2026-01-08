import { Meta, StoryObj } from '@storybook/react';
import { Icon, Button } from '@wordpress/components';
import { cog, external } from '@wordpress/icons';
import IconListItem from './icon-list-item';

const meta: Meta< typeof IconListItem > = {
	title: 'client/dashboard/IconList/IconListItem',
	component: IconListItem,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof IconListItem >;

// Basic examples
export const Default: Story = {
	args: {
		title: 'Settings',
		description: 'Manage your site settings',
		decoration: <Icon icon={ cog } />,
	},
};

export const WithoutDescription: Story = {
	args: {
		title: 'Settings',
		decoration: <Icon icon={ cog } />,
	},
};

export const WithoutDecoration: Story = {
	args: {
		title: 'Settings',
		description: 'Manage your site settings',
	},
};

// Variant examples
export const Prominent: Story = {
	args: {
		title: 'Settings',
		description: 'Bordered and centered icon decoration',
		decoration: <Icon icon={ cog } />,
		variant: 'prominent',
	},
};

export const ProminentWithImage: Story = {
	args: {
		title: 'Featured content',
		description: 'Image decoration with border and sizing',
		decoration: <Icon icon={ <img src="https://placecats.com/300/200" alt="Cat" /> } />,
		variant: 'prominent',
	},
};

// Suffix examples
export const WithSuffix: Story = {
	args: {
		title: 'External link',
		description: 'Action button at the end',
		decoration: <Icon icon={ external } />,
		suffix: (
			<Button variant="secondary" size="compact">
				Visit
			</Button>
		),
	},
};
