import { CloudLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof CloudLogo > = {
	title: 'packages/components/Logos/CloudLogo',
	component: CloudLogo,
};
export default meta;

type Story = StoryObj< typeof CloudLogo >;

export const Default: Story = {};
