import { SiteHub } from '../../packages/edit-site/src';
import type { Meta, StoryObj } from '@storybook/react';
/*
 * Internal dependencies
 */

const meta: Meta< typeof SiteHub > = {
	title: '@wordpress copy/edit-site/components/SiteHub',
	component: SiteHub,
	parameters: {
		controls: { expanded: true },
		layout: 'centered',
	},
};

export default meta;
type Story = StoryObj< typeof SiteHub >;

export const Default: Story = {
	render: function Template( props ) {
		return <SiteHub { ...props } />;
	},
	args: {
		isTransparent: false,
	},
};
