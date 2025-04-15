import { Test } from './';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof Test > = {
	title: 'DS Components/Test',
	component: Test,
};

export default meta;

type Story = StoryObj< typeof Test >;

export const Default: Story = {
	args: {
		children: 'Hello, world',
	},
};
