import { JetpackLogo } from '../index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof JetpackLogo > = {
	title: 'packages/components/Logos/JetpackLogo',
	component: JetpackLogo,
	parameters: {
		controls: { expanded: true },
	},
};
export default meta;

type Story = StoryObj< typeof JetpackLogo >;

export const Default: Story = {};

export const Full: Story = {
	args: {
		full: true,
	},
};

export const Monochrome: Story = {
	args: {
		monochrome: true,
	},
};
