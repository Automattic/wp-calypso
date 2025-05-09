import { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './';

const meta: Meta< typeof Breadcrumbs > = {
	title: 'Breadcrumbs',
	component: Breadcrumbs,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		items: [
			{ label: 'Home', href: 'javascript:void(0)' },
			{ label: 'Products', href: 'javascript:void(0)' },
			{ label: 'Electronics', href: 'javascript:void(0)' },
			{ label: 'Computers', href: 'javascript:void(0)' },
		],
	},
};

export const WithCurrentItemVisible: Story = {
	args: {
		...Default.args,
		showCurrentItem: true,
	},
};

export const WithLongPath: Story = {
	args: {
		...Default.args,
		items: [
			{ label: 'Home', href: 'javascript:void(0)' },
			{ label: 'Products', href: 'javascript:void(0)' },
			{ label: 'Electronics', href: 'javascript:void(0)' },
			{ label: 'Computers', href: 'javascript:void(0)' },
			{ label: 'Laptops', href: 'javascript:void(0)' },
			{ label: 'Gaming', href: 'javascript:void(0)' },
			{ label: '17 inch', href: 'javascript:void(0)' },
			{
				label: 'Alienware X17',
				href: 'javascript:void(0)',
			},
		],
	},
};
