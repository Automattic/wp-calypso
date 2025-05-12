import { Meta, StoryObj } from '@storybook/react';
import { Button, Icon, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { help, wordpress, moreVertical } from '@wordpress/icons';
import { PageHeader } from './index';

const meta = {
	title: 'Unaudited/PageHeader',
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
		actions: [
			<Button key="cancel" variant="secondary">
				Cancel
			</Button>,
			<Button key="save" variant="primary">
				Save Changes
			</Button>,
		],
	},
};

export const FullExample: Story = {
	args: {
		level: 1,
		title: 'Site Customization',
		description: 'Make your site look exactly how you want it to',
		decoration: <Icon icon={ wordpress } />,
		breadcrumbs: [
			{ label: 'Dashboard', href: 'javascript:void(0)' },
			{ label: 'Appearance', href: 'javascript:void(0)' },
			{ label: 'Customize', href: 'javascript:void(0)' },
			{ label: 'Theme', href: 'javascript:void(0)' },
			{ label: 'Advanced', href: 'javascript:void(0)' },
		],
		actions: [
			<Button key="help" icon={ help } variant="tertiary">
				Help
			</Button>,
			<Button key="preview" variant="secondary">
				Preview
			</Button>,
			<DropdownMenu
				key="more-actions"
				icon={ moreVertical }
				label="More actions"
				toggleProps={ { variant: 'tertiary' } }
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
			</DropdownMenu>,
		],
	},
};
