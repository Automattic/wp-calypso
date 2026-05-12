import SocialButton from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SocialButton > = {
	title: 'client/blocks/authentication/SocialButton',
	component: SocialButton,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof SocialButton >;

export const Google: Story = {
	args: {
		provider: 'google',
		children: 'Continue with Google',
	},
};

export const Apple: Story = {
	args: {
		provider: 'apple',
		children: 'Continue with Apple',
	},
};

export const GitHub: Story = {
	args: {
		provider: 'github',
		children: 'Continue with GitHub',
	},
};

export const PayPal: Story = {
	args: {
		provider: 'paypal',
		children: 'Continue with PayPal',
	},
};

export const Email: Story = {
	args: {
		provider: 'email',
		children: 'Continue with email',
	},
};

export const Disabled: Story = {
	args: {
		provider: 'google',
		children: 'Continue with Google',
		disabled: true,
	},
};
