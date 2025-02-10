import { WooLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof WooLogo > = {
	title: 'packages/components/Logos/WooLogo',
	component: WooLogo,
};
export default meta;

type Story = StoryObj< typeof WooLogo >;

export const Default: Story = {};
