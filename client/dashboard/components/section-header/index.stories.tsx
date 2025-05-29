import { Meta, StoryObj } from '@storybook/react';
import { Button, Icon, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { help, wordpress, moreVertical } from '@wordpress/icons';
import { SectionHeader } from './index';

const meta = {
	title: 'client/dashboard/SectionHeader',
	component: SectionHeader,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof SectionHeader >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Settings',
		description: 'Configure your application settings',
	},
};

export const WithActions: Story = {
	args: {
		title: 'Site Settings',
		description: `Manage how your site works and appears. Configure your site's basic functionality,
				appearance, and behavior. These settings control everything from your site title to how your
				content is displayed to visitors.`,
		actions: (
			<>
				<Button variant="secondary" size="compact">
					Cancel
				</Button>
				<Button variant="primary" size="compact">
					Save Changes
				</Button>
			</>
		),
	},
};

export const ImageDecoration: Story = {
	args: {
		title: 'Site Customization',
		description: 'Make your site look exactly how you want it to',
		decoration: <img src="https://placecats.com/300/200" alt="Cat" />,
		actions: (
			<>
				<Button variant="secondary" size="compact">
					Cancel
				</Button>
				<Button variant="primary" size="compact">
					Save Changes
				</Button>
			</>
		),
	},
};

export const FullExample: Story = {
	args: {
		title: 'Site Customization',
		description: 'Make your site look exactly how you want it to',
		decoration: <Icon icon={ wordpress } />,
		actions: (
			<>
				<Button icon={ help } variant="tertiary" size="compact">
					Help
				</Button>
				<Button variant="secondary" size="compact">
					Preview
				</Button>
				<DropdownMenu
					icon={ moreVertical }
					label="More actions"
					toggleProps={ { size: 'compact' } }
				>
					{ () => (
						<>
							<MenuGroup>
								<MenuItem>Import</MenuItem>
								<MenuItem>Export</MenuItem>
								<MenuItem>Settings</MenuItem>
							</MenuGroup>
							<MenuGroup>
								<MenuItem>Help</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
			</>
		),
	},
};
