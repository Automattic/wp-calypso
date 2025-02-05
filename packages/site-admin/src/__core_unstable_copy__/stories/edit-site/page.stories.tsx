import { Page } from '../../packages/edit-site/src';
import type { Meta, StoryObj } from '@storybook/react';
/*
 * Internal dependencies
 */

const meta: Meta< typeof Page > = {
	title: '@wordpress copy/edit-site/components/Page',
	component: Page,
	parameters: {
		controls: { expanded: true },
		layout: 'centered',
	},
};

export default meta;
type Story = StoryObj< typeof Page >;

export const Default: Story = {
	render: function Template( props ) {
		return (
			<Page { ...props }>
				<div>Page content</div>
			</Page>
		);
	},
	args: {
		title: 'Nice page title',
		subTitle: 'Nice page subtitle',
		hideTitleFromUI: false,
	},
};
