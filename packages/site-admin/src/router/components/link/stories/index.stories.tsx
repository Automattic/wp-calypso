/**
 * Internal dependencies
 */
import { Link } from '../';
import { RouterProvider } from '../../../';
import type { Meta, StoryObj } from '@storybook/react';
import './style.stories.scss';

const meta: Meta< typeof Link > = {
	title: 'Components/Link',
	component: Link,
	decorators: [
		function WithRouterProvider( Story ) {
			return (
				<RouterProvider routes={ [] }>
					<Story />
				</RouterProvider>
			);
		},
	],
};

export default meta;

type Story = StoryObj< typeof Link >;

export const Default: Story = {
	args: {
		to: '/home',
		children: 'Homepage',
	},
};
