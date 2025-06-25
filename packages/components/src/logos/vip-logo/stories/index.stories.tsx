import { VIPLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof VIPLogo > = {
	title: 'Unaudited/Logos/VIPLogo',
	component: VIPLogo,
};
export default meta;

type Story = StoryObj< typeof VIPLogo >;

export const Default: Story = {};
