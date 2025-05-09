import { PoweredBy } from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof PoweredBy > = {
	title: 'Unaudited/PoweredBy',
	component: PoweredBy,
};
export default meta;

type Story = StoryObj< typeof PoweredBy >;

export const Jetpack: Story = {
	args: {
		brand: 'jetpack',
	},
};

export const JetpackBlack: Story = {
	args: {
		brand: 'jetpack',
		colorVariant: 'black',
	},
};

export const JetpackWhite: Story = {
	args: {
		brand: 'jetpack',
		colorVariant: 'white',
	},
	decorators: [
		( Story ) => (
			<div style={ { background: '#000', padding: '20px' } }>
				<Story />
			</div>
		),
	],
};

export const WPCom: Story = {
	args: {
		brand: 'wpcom',
	},
};

export const WPComBlack: Story = {
	args: {
		brand: 'wpcom',
		colorVariant: 'black',
	},
};

export const WPComWhite: Story = {
	args: {
		brand: 'wpcom',
		colorVariant: 'white',
	},
	decorators: [
		( Story ) => (
			<div style={ { background: '#000', padding: '20px' } }>
				<Story />
			</div>
		),
	],
};

export const WooCommerce: Story = {
	args: {
		brand: 'woocommerce',
	},
};

export const WooCommerceBlack: Story = {
	args: {
		brand: 'woocommerce',
		colorVariant: 'black',
	},
};

export const WooCommerceWhite: Story = {
	args: {
		brand: 'woocommerce',
		colorVariant: 'white',
	},
	decorators: [
		( Story ) => (
			<div style={ { background: '#000', padding: '20px' } }>
				<Story />
			</div>
		),
	],
};
