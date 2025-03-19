import { Button } from '@wordpress/components';
import type { Meta, StoryObj } from '@storybook/react';

import './index.scss';

Button.displayName = 'Button';

/**
 * This reference is for A8C-specific style overrides for the `Button` component from `@wordpress/components`.
 *
 * See the [WordPress Storybook](https://wordpress.github.io/gutenberg/?path=/docs/components-button--docs) docs for more information.
 */
const meta: Meta< typeof Button > = {
	title: 'packages/components/WP Overrides/Button',
	component: Button,
};

export default meta;
type Story = StoryObj< typeof Button >;

export const Default: Story = {
	args: {
		children: 'Button',
		__next40pxDefaultSize: true,
		accessibleWhenDisabled: true,
	},
};

/**
 * The secondary button styles can be overridden to the A8C styles by adding the
 * `.a8c-components-wp-button` class.
 */
export const Secondary: Story = {
	args: {
		...Default.args,
		variant: 'secondary',
		className: 'a8c-components-wp-button',
	},
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
		},
	},
};
