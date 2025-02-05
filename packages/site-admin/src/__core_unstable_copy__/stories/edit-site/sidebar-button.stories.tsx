import { SidebarButton } from '../../packages/edit-site/src';
import type { Meta, StoryObj } from '@storybook/react';
/*
 * Internal dependencies
 */

const meta: Meta< typeof SidebarButton > = {
	title: '@wordpress copy/edit-site/components/SidebarButton',
	component: SidebarButton,
	parameters: {
		controls: { expanded: true },
		layout: 'centered',
	},
};

export default meta;
type Story = StoryObj< typeof SidebarButton >;

export const Default: Story = {
	render: function Template( props ) {
		return <SidebarButton { ...props } />;
	},
	args: {
		children: 'Click me!',
	},
};
