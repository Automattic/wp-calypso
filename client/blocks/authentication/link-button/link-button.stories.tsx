import LinkButton from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof LinkButton > = {
	title: 'client/blocks/authentication/LinkButton',
	component: LinkButton,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof LinkButton >;

export const Default: Story = {
	args: {
		children: 'Lost your password?',
	},
};

export const AsLink: Story = {
	args: {
		children: 'Lost your password?',
		href: '/log-in/lostpassword',
	},
};

export const Disabled: Story = {
	args: {
		children: 'Lost your password?',
		disabled: true,
	},
};
