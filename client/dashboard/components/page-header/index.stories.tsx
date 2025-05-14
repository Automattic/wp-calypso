import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { Meta, StoryObj } from '@storybook/react';
import { Button, Icon, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { help, wordpress, moreVertical } from '@wordpress/icons';
import { PageHeader } from './index';

const meta = {
	title: 'client/dashboard/PageHeader',
	component: PageHeader,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof PageHeader >;

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
				<Button variant="secondary">Cancel</Button>
				<Button variant="primary">Save Changes</Button>
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
				<Button variant="secondary">Cancel</Button>
				<Button variant="primary">Save Changes</Button>
			</>
		),
	},
};

export const FullExample: Story = {
	args: {
		title: 'Site Customization',
		description: 'Make your site look exactly how you want it to',
		decoration: <Icon icon={ wordpress } />,
		breadcrumbs: (
			<Breadcrumbs
				items={ [
					{ label: 'Dashboard', href: 'javascript:void(0)' },
					{ label: 'Appearance', href: 'javascript:void(0)' },
					{ label: 'Customize', href: 'javascript:void(0)' },
					{ label: 'Theme', href: 'javascript:void(0)' },
					{ label: 'Advanced', href: 'javascript:void(0)' },
				] }
			/>
		),
		actions: (
			<>
				<Button icon={ help } variant="tertiary" __next40pxDefaultSize>
					Help
				</Button>
				<Button variant="secondary" __next40pxDefaultSize>
					Preview
				</Button>
				<DropdownMenu
					icon={ moreVertical }
					label="More actions"
					toggleProps={ { __next40pxDefaultSize: true } }
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
