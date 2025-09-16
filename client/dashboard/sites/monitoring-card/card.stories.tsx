import { Meta, StoryObj } from '@storybook/react';
import {
	RouterProvider,
	createMemoryHistory,
	createRouter,
	createRootRoute,
} from '@tanstack/react-router';
import MonitoringCard from './';

const meta = {
	title: 'client/dashboard/MonitoringCard',
	component: MonitoringCard,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	decorators: [
		( Story ) => (
			<RouterProvider
				router={ createRouter( {
					basepath: '/',
					routeTree: createRootRoute( { component: Story } ),
					history: createMemoryHistory(),
				} ) }
			/>
		),
	],
} satisfies Meta< typeof MonitoringCard >;

export default meta;
type Story = StoryObj< typeof meta >;

const defaultArgs = {
	title: 'Server performance',
	description: 'Requests per minute and average server response time.',
	onAnchorClick: () => {},
	onDownloadClick: () => {},
	isLoading: false,
};

export const Default: Story = {
	args: {
		...defaultArgs,
		children:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
	},
};

export const Loading: Story = {
	args: {
		...defaultArgs,
		isLoading: true,
	},
};
