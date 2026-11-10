import { StatusIndicator } from './status-indicator';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof StatusIndicator > = {
	title: 'Primitives/StatusIndicator',
	component: StatusIndicator,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		tone: { control: 'radio', options: [ 'primary', 'error', 'muted' ] },
		size: { control: 'number' },
	},
} satisfies Meta< typeof StatusIndicator >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Primary: Story = {
	args: {},
};

export const Error: Story = {
	args: { tone: 'error' },
};

export const Muted: Story = {
	args: { tone: 'muted' },
};

export const Large: Story = {
	args: { size: 24 },
};
