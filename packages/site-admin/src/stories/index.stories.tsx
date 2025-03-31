/**
 * Internal dependencies
 */
import { useEffect } from '@wordpress/element';
import { App } from './app';
/**
 * Types
 */
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof App > = {
	title: 'Components/App',
	component: App,
	tags: [ 'autodocs' ],
	decorators: [
		function AppDecoration( Story ) {
			useEffect( () => {
				document.body.classList.add( 'is-app-story' );
				return () => document.body.classList.remove( 'is-app-story' );
			}, [] );

			return <Story />;
		},
	],
};

export default meta;

type Story = StoryObj< typeof App >;

/**
 * This story shows a working app that demonstrates
 * all the resources provided by the package and how to use them.
 */
export const Default: Story = {};
