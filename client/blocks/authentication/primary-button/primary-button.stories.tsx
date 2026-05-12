import PrimaryButton from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof PrimaryButton > = {
	title: 'client/blocks/authentication/PrimaryButton',
	component: PrimaryButton,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof PrimaryButton >;

export const Default: Story = {
	args: {
		children: 'Continue',
	},
};

export const Busy: Story = {
	args: {
		children: 'Continue',
		isBusy: true,
	},
};

export const Disabled: Story = {
	args: {
		children: 'Continue',
		disabled: true,
	},
};

export const AsLink: Story = {
	args: {
		children: 'Continue',
		href: 'https://wordpress.com',
	},
};
