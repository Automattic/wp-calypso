import { CoreBadge } from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof CoreBadge > = {
	component: CoreBadge,
	title: 'CoreBadge',
};

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		children: 'Code is Poetry',
	},
};

export const Info: Story = {
	args: {
		...Default.args,
		intent: 'info',
	},
};

export const Success: Story = {
	args: {
		...Default.args,
		intent: 'success',
	},
};

export const Warning: Story = {
	args: {
		...Default.args,
		intent: 'warning',
	},
};

export const Error: Story = {
	args: {
		...Default.args,
		intent: 'error',
	},
};
