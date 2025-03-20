import { SidebarButton } from '../';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SidebarButton > = {
	title: 'Components/SidebarButton',
	component: SidebarButton,
};

export default meta;

type Story = StoryObj< typeof SidebarButton >;

export const Default: Story = {
	args: {
		children: 'Sidebar Button',
	},
};
