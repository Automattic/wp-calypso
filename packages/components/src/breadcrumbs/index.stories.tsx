import { Meta, StoryObj } from '@storybook/react';
import { BreadcrumbItemProps } from './types';
import Breadcrumb from './index';

// Define example items for the controls
const itemsOptions: Record< string, BreadcrumbItemProps[] > = {
	'3 items': [
		{ label: 'Home', href: '#' },
		{ label: 'Products', href: '#' },
		{ label: 'Electronics', href: '#' },
	],
	'5 items': [
		{ label: 'Dashboard', href: '#' },
		{ label: 'Settings', href: '#' },
		{ label: 'Profile', href: '#' },
		{ label: 'Account', href: '#' },
		{ label: 'Security', href: '#' },
	],
	'7 items': [
		{ label: 'Home', href: '#' },
		{ label: 'Products', href: '#' },
		{ label: 'Electronics', href: '#' },
		{ label: 'Computers', href: '#' },
		{ label: 'Laptops', href: '#' },
		{ label: 'Gaming', href: '#' },
		{
			label: 'Alienware X17',
			href: '#',
		},
	],
};

const meta = {
	title: 'packages/components/Breadcrumb',
	component: Breadcrumb,
	tags: [ 'autodocs' ],
	argTypes: {
		items: {
			control: 'select',
			options: Object.keys( itemsOptions ),
			mapping: itemsOptions,
			description: 'Pre-defined breadcrumb trails',
		},
	},
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof Breadcrumb >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		items: itemsOptions[ '3 items' ],
	},
};

export const VisibleCurrentPage: Story = {
	args: {
		items: itemsOptions[ '5 items' ],
		showCurrentItem: true,
	},
};

export const LongPath: Story = {
	args: {
		items: itemsOptions[ '7 items' ],
	},
};
