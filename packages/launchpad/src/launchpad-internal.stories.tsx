import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'msw';
import LaunchpadInternal from './launchpad-internal';
import { launchpadResolver } from './msw/resolver';
import type { Meta, StoryObj } from '@storybook/react';

const queryClient = new QueryClient();

const meta: Meta< typeof LaunchpadInternal > = {
	title: 'Launchpad/LaunchpadInternal',
	component: LaunchpadInternal,
	decorators: [
		( Story ) => (
			<QueryClientProvider client={ queryClient }>
				<Story />
			</QueryClientProvider>
		),
	],
	parameters: {
		msw: {
			handlers: [ http.get( '/wpcom/v2/sites/*/launchpad', launchpadResolver ) ],
		},
	},
	args: {
		site: null,
		siteSlug: 'example.wordpress.com',
		launchpadContext: 'fullscreen',
		checklistSlug: 'free',
	},
	argTypes: {
		checklistSlug: {
			defaultValue: 'free',
			options: [ 'free' ],
			control: { type: 'select' },
		},
	},
};

type Story = StoryObj< typeof meta >;
export const Default: Story = {};
export const Loading: Story = {
	parameters: {
		msw: {
			delay: 1000,
		},
	},
};

export default meta;
