import { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './';

const meta: Meta< typeof Breadcrumbs > = {
	title: 'packages/components/Breadcrumbs',
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
			{ label: 'Home', href: '#' },
			{ label: 'Products', href: '#' },
			{ label: 'Electronics', href: '#' },
			{ label: 'Computers', href: '#' },
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
			{ label: 'Home', href: '#' },
			{ label: 'Products', href: '#' },
			{ label: 'Electronics', href: '#' },
			{ label: 'Computers', href: '#' },
			{ label: 'Laptops', href: '#' },
			{ label: 'Gaming', href: '#' },
			{ label: '17 inch', href: '#' },
			{
				label: 'Alienware X17',
				href: '#',
			},
		],
	},
};
