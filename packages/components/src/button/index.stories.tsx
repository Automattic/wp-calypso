import { fn } from '@storybook/test';
import { Button } from '.';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * This button has been deprecated due to aggressive and generic CSS that breaks many other buttons when imported.
 * Use the [`Button` component](https://wordpress.github.io/gutenberg/?path=/docs/components-button--docs)
 * from `@wordpress/components` instead.
 */
const meta: Meta< typeof Button > = {
	title: 'packages/components/Button',
	component: Button,
	args: {
		onClick: fn(),
	},
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
		},
	},
};
export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		children: 'Hello World!',
	},
};

export const Compact: Story = {
	...Default,
	args: {
		...Default.args,
		compact: true,
	},
};

export const Busy: Story = {
	...Default,
	args: {
		...Default.args,
		busy: true,
	},
};

export const Scary: Story = {
	...Default,
	args: {
		...Default.args,
		scary: true,
	},
};

export const Borderless: Story = {
	...Default,
	args: {
		...Default.args,
		borderless: true,
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
	},
};

export const Link: Story = {
	...Default,
	args: {
		...Default.args,
		href: 'https://www.automattic.com/',
		target: '_blank',
	},
};

export const Plain: Story = {
	...Default,
	args: {
		...Default.args,
		plain: true,
	},
};

export const Transparent: Story = {
	...Default,
	args: {
		...Default.args,
		transparent: true,
		style: {
			'--transparent-button-text-color': '#eee',
			'--transparent-button-text-color-hover': '#00b9eb',
		},
	},
	decorators: [
		( Story ) => (
			<div style={ { padding: '20px', background: 'black' } }>
				<Story />
			</div>
		),
	],
};
