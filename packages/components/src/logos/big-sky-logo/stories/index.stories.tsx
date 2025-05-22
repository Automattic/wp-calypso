import { Mark } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Mark > = {
	title: 'Unaudited/Logos/BigSkyLogo.Mark',
	component: Mark,
};
export default meta;

type Story = StoryObj< typeof Mark >;

export const Default: Story = {};
