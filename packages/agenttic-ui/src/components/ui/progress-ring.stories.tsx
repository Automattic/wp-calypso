import { ProgressRing } from './progress-ring';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ProgressRing > = {
	title: 'Primitives/ProgressRing',
	component: ProgressRing,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		percent: { control: { type: 'range', min: 0, max: 100, step: 1 } },
		tone: { control: 'radio', options: [ 'primary', 'error', 'muted' ] },
		size: { control: 'number' },
		strokeWidth: { control: 'number' },
	},
} satisfies Meta< typeof ProgressRing >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Full: Story = {
	args: { percent: 100 },
};

export const Partial: Story = {
	args: { percent: 55 },
};

export const Error: Story = {
	args: { percent: 15, tone: 'error' },
};

export const Empty: Story = {
	args: { percent: 0, tone: 'error' },
};

export const Muted: Story = {
	args: { percent: 72, tone: 'muted' },
};

export const Large: Story = {
	args: { percent: 55, size: 40, strokeWidth: 4 },
};
