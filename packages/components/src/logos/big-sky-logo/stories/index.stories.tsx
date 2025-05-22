import { BigSkyLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof BigSkyLogo.Mark > = {
	title: 'Unaudited/Logos/BigSkyLogo',
	component: BigSkyLogo.Mark,
};
export default meta;

type Story = StoryObj< typeof BigSkyLogo.Mark >;

export const Default: Story = {};

export const Monochrome: Story = {
	args: {
		monochrome: true,
	},
};

export const LargeSize: Story = {
	args: {
		height: 48,
	},
};

export const Normalized: Story = {
	args: {
		normalized: true,
	},
};

export const CustomTitle: Story = {
	args: {
		title: 'Custom Big Sky Logo Title',
	},
};
