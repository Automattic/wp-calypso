import React from 'react';
import { Button } from './storybook-utils/typed-wp-components';
import type { Meta, StoryObj } from '@storybook/react';

// Not using a relative path here to ensure that the build is working.
import '@automattic/components/styles/wp-button-override.scss';

/**
 * This reference is for A8C-specific style overrides for the `Button` component from `@wordpress/components`.
 *
 * See the [WordPress Storybook](https://wordpress.github.io/gutenberg/?path=/docs/components-button--docs) docs for more information.
 */
const meta: Meta< typeof Button > = {
	title: 'WP Overrides/Button',
	component: Button,
	decorators: [
		( Story ) => (
			<div style={ { fontFamily: 'sans-serif' } }>
				<Story />
			</div>
		),
	],
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
 *
 * To load these styles, import the `@automattic/components/styles/wp-button-override.scss` file
 * somewhere in your project.
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
